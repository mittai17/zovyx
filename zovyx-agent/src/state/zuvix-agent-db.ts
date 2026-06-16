// Zuvix agent database stores agent-scoped persisted runtime state.
import { chmodSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import {
  clearNodeSqliteKyselyCacheForDatabase,
  executeSqliteQuerySync,
  getNodeSqliteKysely,
} from "../infra/kysely-sync.js";
import { requireNodeSqlite } from "../infra/node-sqlite.js";
import { runSqliteImmediateTransactionSync } from "../infra/sqlite-transaction.js";
import {
  configureSqliteConnectionPragmas,
  type SqliteWalMaintenance,
} from "../infra/sqlite-wal.js";
import { normalizeAgentId } from "../routing/session-key.js";
import type { DB as ZuvixAgentKyselyDatabase } from "./zuvix-agent-db.generated.js";
import { resolveZuvixAgentSqlitePath } from "./zuvix-agent-db.paths.js";
import { ZUVIX_AGENT_SCHEMA_SQL } from "./zuvix-agent-schema.generated.js";
import type { DB as ZuvixStateKyselyDatabase } from "./zuvix-state-db.generated.js";
import {
  ZUVIX_SQLITE_BUSY_TIMEOUT_MS,
  openZuvixStateDatabase,
  runZuvixStateWriteTransaction,
  type ZuvixStateDatabaseOptions,
} from "./zuvix-state-db.js";
export { resolveZuvixAgentSqlitePath } from "./zuvix-agent-db.paths.js";

/**
 * Per-agent SQLite database lifecycle and shared-state registration.
 *
 * Each opened agent database is schema-owned by one normalized agent id, cached
 * per pathname, protected with private file modes, and registered in the shared
 * Zuvix state database for discovery and maintenance.
 */
const ZUVIX_AGENT_SCHEMA_VERSION = 1;
const ZUVIX_AGENT_DB_DIR_MODE = 0o700;
const ZUVIX_AGENT_DB_FILE_MODE = 0o600;
const ZUVIX_AGENT_DB_SIDECAR_SUFFIXES = ["", "-shm", "-wal"] as const;

/** Open per-agent SQLite database handle plus lifecycle maintenance. */
export type ZuvixAgentDatabase = {
  agentId: string;
  db: DatabaseSync;
  path: string;
  walMaintenance: SqliteWalMaintenance;
};

/** Options for resolving and opening one agent database. */
export type ZuvixAgentDatabaseOptions = ZuvixStateDatabaseOptions & {
  agentId: string;
};

/** Shared-state registry row describing an agent database seen by this process. */
export type ZuvixRegisteredAgentDatabase = {
  agentId: string;
  path: string;
  schemaVersion: number;
  lastSeenAt: number;
  sizeBytes: number | null;
};

type ZuvixAgentMetadataDatabase = Pick<ZuvixAgentKyselyDatabase, "schema_meta">;
type ZuvixAgentRegistryDatabase = Pick<ZuvixStateKyselyDatabase, "agent_databases">;

const cachedDatabases = new Map<string, ZuvixAgentDatabase>();

type ExistingSchemaMeta = {
  agentId: string | null;
  role: string | null;
};

function readSqliteUserVersion(db: DatabaseSync): number {
  const row = db.prepare("PRAGMA user_version").get() as { user_version?: unknown } | undefined;
  return Number(row?.user_version ?? 0);
}

function assertSupportedAgentSchemaVersion(db: DatabaseSync, pathname: string): void {
  const userVersion = readSqliteUserVersion(db);
  if (userVersion > ZUVIX_AGENT_SCHEMA_VERSION) {
    throw new Error(
      `Zuvix agent database ${pathname} uses newer schema version ${userVersion}; this Zuvix build supports ${ZUVIX_AGENT_SCHEMA_VERSION}.`,
    );
  }
}

function ensureZuvixAgentDatabasePermissions(
  pathname: string,
  options: ZuvixAgentDatabaseOptions,
): void {
  const dir = path.dirname(pathname);
  const defaultPath = resolveZuvixAgentSqlitePath({
    agentId: options.agentId,
    env: options.env,
  });
  const isDefaultAgentDatabase = path.resolve(pathname) === path.resolve(defaultPath);
  const dirExisted = existsSync(dir);
  mkdirSync(dir, { recursive: true, mode: ZUVIX_AGENT_DB_DIR_MODE });
  // Default agent state is private by contract; custom pre-existing dirs keep caller ownership.
  if (isDefaultAgentDatabase || !dirExisted) {
    chmodSync(dir, ZUVIX_AGENT_DB_DIR_MODE);
  }
  for (const suffix of ZUVIX_AGENT_DB_SIDECAR_SUFFIXES) {
    const candidate = `${pathname}${suffix}`;
    if (existsSync(candidate)) {
      chmodSync(candidate, ZUVIX_AGENT_DB_FILE_MODE);
    }
  }
}

function readExistingSchemaMeta(db: DatabaseSync): ExistingSchemaMeta | null {
  const schemaMetaTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_meta'")
    .get();
  if (!schemaMetaTable) {
    return null;
  }
  const row = db
    .prepare("SELECT role, agent_id FROM schema_meta WHERE meta_key = 'primary'")
    .get() as { agent_id?: unknown; role?: unknown } | undefined;
  if (!row) {
    return null;
  }
  return {
    agentId: typeof row.agent_id === "string" ? row.agent_id : null,
    role: typeof row.role === "string" ? row.role : null,
  };
}

function assertExistingSchemaOwner(
  existing: ExistingSchemaMeta | null,
  agentId: string,
  pathname: string,
): void {
  if (!existing) {
    return;
  }
  // Agent DB files are not interchangeable; opening another role/id would corrupt ownership.
  if (existing.role !== "agent") {
    throw new Error(
      `Zuvix agent database ${pathname} has schema role ${existing.role ?? "unknown"}; expected agent.`,
    );
  }
  if (!existing.agentId) {
    throw new Error(`Zuvix agent database ${pathname} has no agent owner.`);
  }
  if (normalizeAgentId(existing.agentId) !== agentId) {
    throw new Error(
      `Zuvix agent database ${pathname} belongs to agent ${existing.agentId}; requested agent ${agentId}.`,
    );
  }
}

function ensureAgentSchema(db: DatabaseSync, agentId: string, pathname: string): void {
  assertSupportedAgentSchemaVersion(db, pathname);
  assertExistingSchemaOwner(readExistingSchemaMeta(db), agentId, pathname);
  db.exec(ZUVIX_AGENT_SCHEMA_SQL);
  const kysely = getNodeSqliteKysely<ZuvixAgentMetadataDatabase>(db);
  db.exec(`PRAGMA user_version = ${ZUVIX_AGENT_SCHEMA_VERSION};`);
  const now = Date.now();
  executeSqliteQuerySync(
    db,
    kysely
      .insertInto("schema_meta")
      .values({
        meta_key: "primary",
        role: "agent",
        schema_version: ZUVIX_AGENT_SCHEMA_VERSION,
        agent_id: agentId,
        app_version: null,
        created_at: now,
        updated_at: now,
      })
      .onConflict((conflict) =>
        conflict.column("meta_key").doUpdateSet({
          role: "agent",
          schema_version: ZUVIX_AGENT_SCHEMA_VERSION,
          agent_id: agentId,
          app_version: null,
          updated_at: now,
        }),
      ),
  );
}

function registerAgentDatabase(params: {
  agentId: string;
  path: string;
  env?: NodeJS.ProcessEnv;
}): void {
  let sizeBytes: number | null = null;
  try {
    sizeBytes = statSync(params.path).size;
  } catch {
    sizeBytes = null;
  }
  const lastSeenAt = Date.now();
  runZuvixStateWriteTransaction(
    (database) => {
      const db = getNodeSqliteKysely<ZuvixAgentRegistryDatabase>(database.db);
      executeSqliteQuerySync(
        database.db,
        db
          .insertInto("agent_databases")
          .values({
            agent_id: params.agentId,
            path: params.path,
            schema_version: ZUVIX_AGENT_SCHEMA_VERSION,
            last_seen_at: lastSeenAt,
            size_bytes: sizeBytes,
          })
          .onConflict((conflict) =>
            conflict.columns(["agent_id", "path"]).doUpdateSet({
              schema_version: ZUVIX_AGENT_SCHEMA_VERSION,
              last_seen_at: lastSeenAt,
              size_bytes: sizeBytes,
            }),
          ),
      );
    },
    { env: params.env },
  );
}

/** List agent databases recorded in the shared Zuvix state registry. */
export function listZuvixRegisteredAgentDatabases(
  options: ZuvixStateDatabaseOptions = {},
): ZuvixRegisteredAgentDatabase[] {
  const database = openZuvixStateDatabase(options);
  const db = getNodeSqliteKysely<ZuvixAgentRegistryDatabase>(database.db);
  const rows = executeSqliteQuerySync(
    database.db,
    db.selectFrom("agent_databases").selectAll().orderBy("agent_id", "asc").orderBy("path", "asc"),
  ).rows;
  return rows.map((row) => ({
    agentId: normalizeAgentId(row.agent_id),
    path: row.path,
    schemaVersion: row.schema_version,
    lastSeenAt: row.last_seen_at,
    sizeBytes: row.size_bytes,
  }));
}

/** Open or return a cached per-agent database after schema and owner validation. */
export function openZuvixAgentDatabase(
  options: ZuvixAgentDatabaseOptions,
): ZuvixAgentDatabase {
  const agentId = normalizeAgentId(options.agentId);
  const databaseOptions = { ...options, agentId };
  const pathname = resolveZuvixAgentSqlitePath(databaseOptions);
  const cached = cachedDatabases.get(pathname);
  if (cached?.db.isOpen) {
    if (cached.agentId !== agentId) {
      throw new Error(
        `Zuvix agent database ${pathname} is already open for agent ${cached.agentId}; requested agent ${agentId}.`,
      );
    }
    registerAgentDatabase({ agentId, path: pathname, env: options.env });
    return cached;
  }
  if (cached) {
    // A closed handle can leave Kysely and WAL helpers cached; clear both before reopening.
    cached.walMaintenance.close();
    clearNodeSqliteKyselyCacheForDatabase(cached.db);
    cachedDatabases.delete(pathname);
  }

  ensureZuvixAgentDatabasePermissions(pathname, databaseOptions);
  const sqlite = requireNodeSqlite();
  const db = new sqlite.DatabaseSync(pathname);
  const walMaintenance = configureSqliteConnectionPragmas(db, {
    busyTimeoutMs: ZUVIX_SQLITE_BUSY_TIMEOUT_MS,
    databaseLabel: `zuvix-agent:${agentId}`,
    databasePath: pathname,
    foreignKeys: true,
    synchronous: "NORMAL",
  });
  try {
    ensureAgentSchema(db, agentId, pathname);
  } catch (err) {
    walMaintenance.close();
    db.close();
    throw err;
  }
  ensureZuvixAgentDatabasePermissions(pathname, databaseOptions);
  const database = { agentId, db, path: pathname, walMaintenance };
  cachedDatabases.set(pathname, database);
  registerAgentDatabase({ agentId, path: pathname, env: options.env });
  return database;
}

/** Run a synchronous immediate transaction against an agent database. */
export function runZuvixAgentWriteTransaction<T>(
  operation: (database: ZuvixAgentDatabase) => T,
  options: ZuvixAgentDatabaseOptions,
): T {
  const database = openZuvixAgentDatabase(options);
  const result = runSqliteImmediateTransactionSync(database.db, () => operation(database));
  ensureZuvixAgentDatabasePermissions(database.path, options);
  return result;
}

/** Close cached agent databases so tests can remove temp dirs and reopen cleanly. */
export function closeZuvixAgentDatabasesForTest(): void {
  for (const database of cachedDatabases.values()) {
    database.walMaintenance.close();
    clearNodeSqliteKyselyCacheForDatabase(database.db);
    database.db.close();
  }
  cachedDatabases.clear();
}
