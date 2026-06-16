// Proxy capture env helpers build proxy-related env vars for child processes.
import { randomUUID } from "node:crypto";
import type { Agent } from "node:http";
import process from "node:process";
import { createAmbientNodeProxyAgent } from "@zuvix/proxyline";
import {
  resolveDebugProxyBlobDir,
  resolveDebugProxyCertDir,
  resolveDebugProxyDbPath,
} from "./paths.js";

// Environment contract for debug proxy capture. These vars are passed to child
// processes and provider transports so capture sessions share one store/proxy.
export const ZUVIX_DEBUG_PROXY_ENABLED = "ZUVIX_DEBUG_PROXY_ENABLED";
export const ZUVIX_DEBUG_PROXY_URL = "ZUVIX_DEBUG_PROXY_URL";
export const ZUVIX_DEBUG_PROXY_DB_PATH = "ZUVIX_DEBUG_PROXY_DB_PATH";
export const ZUVIX_DEBUG_PROXY_BLOB_DIR = "ZUVIX_DEBUG_PROXY_BLOB_DIR";
export const ZUVIX_DEBUG_PROXY_CERT_DIR = "ZUVIX_DEBUG_PROXY_CERT_DIR";
export const ZUVIX_DEBUG_PROXY_SESSION_ID = "ZUVIX_DEBUG_PROXY_SESSION_ID";
export const ZUVIX_DEBUG_PROXY_REQUIRE = "ZUVIX_DEBUG_PROXY_REQUIRE";

export type DebugProxySettings = {
  enabled: boolean;
  required: boolean;
  proxyUrl?: string;
  dbPath: string;
  blobDir: string;
  certDir: string;
  sessionId: string;
  sourceProcess: string;
};

let cachedImplicitSessionId: string | undefined;

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function resolveDebugProxySettings(
  env: NodeJS.ProcessEnv = process.env,
): DebugProxySettings {
  const enabled = isTruthy(env[ZUVIX_DEBUG_PROXY_ENABLED]);
  const explicitSessionId = env[ZUVIX_DEBUG_PROXY_SESSION_ID]?.trim() || undefined;
  // Local implicit sessions stay stable within one process so repeated callers
  // write to the same capture session until an explicit id overrides it.
  const sessionId = explicitSessionId ?? (cachedImplicitSessionId ??= randomUUID());
  return {
    enabled,
    required: isTruthy(env[ZUVIX_DEBUG_PROXY_REQUIRE]),
    proxyUrl: env[ZUVIX_DEBUG_PROXY_URL]?.trim() || undefined,
    dbPath: env[ZUVIX_DEBUG_PROXY_DB_PATH]?.trim() || resolveDebugProxyDbPath(env),
    blobDir: env[ZUVIX_DEBUG_PROXY_BLOB_DIR]?.trim() || resolveDebugProxyBlobDir(env),
    certDir: env[ZUVIX_DEBUG_PROXY_CERT_DIR]?.trim() || resolveDebugProxyCertDir(env),
    sessionId,
    sourceProcess: "zuvix",
  };
}

export function applyDebugProxyEnv(
  env: NodeJS.ProcessEnv,
  params: {
    proxyUrl: string;
    sessionId: string;
    dbPath?: string;
    blobDir?: string;
    certDir?: string;
  },
): NodeJS.ProcessEnv {
  // Child process env forces proxy capture and standard proxy variables while
  // preserving unrelated environment values.
  return {
    ...env,
    [ZUVIX_DEBUG_PROXY_ENABLED]: "1",
    [ZUVIX_DEBUG_PROXY_REQUIRE]: "1",
    [ZUVIX_DEBUG_PROXY_URL]: params.proxyUrl,
    [ZUVIX_DEBUG_PROXY_DB_PATH]: params.dbPath ?? resolveDebugProxyDbPath(env),
    [ZUVIX_DEBUG_PROXY_BLOB_DIR]: params.blobDir ?? resolveDebugProxyBlobDir(env),
    [ZUVIX_DEBUG_PROXY_CERT_DIR]: params.certDir ?? resolveDebugProxyCertDir(env),
    [ZUVIX_DEBUG_PROXY_SESSION_ID]: params.sessionId,
    HTTP_PROXY: params.proxyUrl,
    HTTPS_PROXY: params.proxyUrl,
    ALL_PROXY: params.proxyUrl,
  };
}

export function createDebugProxyWebSocketAgent(settings: DebugProxySettings): Agent | undefined {
  if (!settings.enabled || !settings.proxyUrl) {
    return undefined;
  }
  return createAmbientNodeProxyAgent({
    protocol: "https",
    env: {
      HTTP_PROXY: settings.proxyUrl,
      HTTPS_PROXY: settings.proxyUrl,
      ALL_PROXY: undefined,
      NO_PROXY: undefined,
      http_proxy: undefined,
      https_proxy: undefined,
      all_proxy: undefined,
      no_proxy: undefined,
    },
  }) as Agent | undefined;
}

// Configured URLs win over ambient capture settings; callers use this when a
// channel/provider already exposes an explicit proxy option.
export function resolveEffectiveDebugProxyUrl(configuredProxyUrl?: string): string | undefined {
  const explicit = configuredProxyUrl?.trim();
  if (explicit) {
    return explicit;
  }
  const settings = resolveDebugProxySettings();
  return settings.enabled ? settings.proxyUrl : undefined;
}
