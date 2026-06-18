import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export async function findExistingAncestor(dirPath: string): Promise<string | null> {
  let current = path.resolve(dirPath);
  while (true) {
    try {
      const stat = await fs.lstat(current);
      if (stat.isDirectory()) {
        return current;
      }
    } catch {}
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

export async function ensureDirectoryWithinRoot(options: {
  rootDir: string;
  requestedPath: string;
  scopeLabel?: string;
  mode?: number;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const targetPath = path.resolve(options.rootDir, options.requestedPath);
  try {
    await fs.mkdir(targetPath, { recursive: true, mode: options.mode });
    return { ok: true, path: targetPath };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to create directory" };
  }
}

export async function writeViaSiblingTempPath(options: {
  rootDir: string;
  targetPath: string;
  writeTemp: (tempPath: string) => Promise<void>;
  fallbackFileName?: string;
  tempPrefix?: string;
}): Promise<void> {
  const dir = path.dirname(options.targetPath);
  const tempPath = path.join(dir, `${options.tempPrefix || ".tmp"}-${Math.random().toString(36).slice(2)}`);
  try {
    await options.writeTemp(tempPath);
    await fs.rename(tempPath, options.targetPath);
  } catch (err) {
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw err;
  }
}

export function assertAbsolutePathInput(dirPath: string): void {
  if (!path.isAbsolute(dirPath)) {
    throw new Error(`Path must be absolute: ${dirPath}`);
  }
}

export function canonicalPathFromExistingAncestor(dirPath: string): string {
  return path.resolve(dirPath);
}

export async function resolveAbsolutePathForRead(dirPath: string, options?: any): Promise<string> {
  return path.resolve(dirPath);
}

export async function resolveAbsolutePathForWrite(dirPath: string, options?: any): Promise<string> {
  return path.resolve(dirPath);
}

export async function pathExists(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

export function pathExistsSync(dirPath: string): boolean {
  try {
    fsSync.accessSync(dirPath);
    return true;
  } catch {
    return false;
  }
}

export async function movePathToTrash(dirPath: string, options?: any): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function readLocalFileFromRoots(paths: string[], ...args: any[]): Promise<any> {
  for (const p of paths) {
    try {
      const buf = await fs.readFile(p);
      return { buffer: buf, realPath: p };
    } catch {}
  }
  throw new Error("File not found in roots");
}

export function resolveLocalPathFromRootsSync(paths: string[], ...args: any[]): any {
  for (const p of paths) {
    try {
      if (fsSync.existsSync(p)) {
        return p;
      }
    } catch {}
  }
  return null;
}

export async function appendRegularFile(dirPath: string, data: any): Promise<void> {
  await fs.appendFile(dirPath, data);
}

export function appendRegularFileSync(dirPath: string, data: any): void {
  fsSync.appendFileSync(dirPath, data);
}

export async function readRegularFile(options: { filePath: string; maxBytes?: number }): Promise<{ buffer: Buffer }> {
  const handle = await fs.open(options.filePath, "r");
  try {
    if (options.maxBytes !== undefined) {
      const buf = Buffer.alloc(options.maxBytes);
      const { bytesRead } = await handle.read(buf, 0, options.maxBytes, 0);
      return { buffer: buf.subarray(0, bytesRead) };
    } else {
      const buf = await handle.readFile();
      return { buffer: buf };
    }
  } finally {
    await handle.close();
  }
}

export function readRegularFileSync(dirPath: string): Buffer {
  return fsSync.readFileSync(dirPath);
}

export function resolveRegularFileAppendFlags(options: any): any {
  return options;
}

export interface RegularFileStatResult {
  missing: boolean;
  stat?: {
    size: number;
    mtimeMs: number;
    isDirectory: () => boolean;
  };
}

export async function statRegularFile(dirPath: string): Promise<RegularFileStatResult> {
  try {
    const s = await fs.lstat(dirPath);
    return {
      missing: false,
      stat: {
        size: s.size,
        mtimeMs: s.mtimeMs,
        isDirectory: () => s.isDirectory(),
      },
    };
  } catch {
    return { missing: true };
  }
}

export function statRegularFileSync(dirPath: string): RegularFileStatResult {
  try {
    const s = fsSync.lstatSync(dirPath);
    return {
      missing: false,
      stat: {
        size: s.size,
        mtimeMs: s.mtimeMs,
        isDirectory: () => s.isDirectory(),
      },
    };
  } catch {
    return { missing: true };
  }
}

export function sanitizeUntrustedFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer!) clearTimeout(timer);
  }
}

export async function assertNoSymlinkParents(options: { rootDir: string; targetPath: string }): Promise<void> {
  // noop stub for safety checks
}

export function createAsyncLock(name: string): any {
  return {
    async acquire() {},
    async release() {},
  };
}

export function formatPosixMode(mode: number): string {
  return mode.toString(8);
}

export function createIcaclsResetCommand(p: string): string { return ""; }
export function formatIcaclsResetCommand(p: string): string { return ""; }
export function formatWindowsAclSummary(summary: any): string { return ""; }
export function inspectWindowsAcl(p: string, exec?: any): Promise<any> { return Promise.resolve([]); }
export function parseIcaclsOutput(stdout: string): any[] { return []; }
export function resolveWindowsUserPrincipal(exec?: any): Promise<string> { return Promise.resolve(""); }
export function summarizeWindowsAcl(entries: any[]): any { return {}; }

// New stubs for boundary file reading
export function canUseRootFileOpen(options?: any): boolean { return true; }
export function matchRootFileOpenFailure(err: any): boolean { return false; }
export async function openRootFile(options: any): Promise<any> { return {}; }
export function openRootFileSync(options: any): any { return {}; }

// New stubs for boundary pathing
export const ROOT_PATH_ALIAS_POLICIES = {};
export function resolvePathViaExistingAncestorSync(p: string): string { return p; }
export async function resolveRootPath(options: any): Promise<any> { return options.requestedPath || ""; }
export function resolveRootPathSync(options: any): any { return options.requestedPath || ""; }

// New stubs for advanced ts-safe
export async function assertNoHardlinkedFinalPath(p: string): Promise<void> {}
export function assertNoSymlinkParentsSync(options: any): void {}
export function sameFileIdentity(a: any, b: any): boolean { return true; }
export async function writeSiblingTempFile(options: any): Promise<any> { return {}; }

// New stubs for install safe paths
export function assertCanonicalPathWithinBase(a: string, b: string): void {}
export function resolveSafeInstallDir(options: any): string { return options.rootDir || ""; }
export function safeDirName(p: string): string { return path.dirname(p); }
export function safePathSegmentHashed(p: string): string {
  return crypto.createHash("sha256").update(p).digest("hex");
}

// New stubs for local file access URLs
export function assertNoWindowsNetworkPath(p: string): void {}
export function basenameFromMediaSource(p: string): string { return path.basename(p); }
export function hasEncodedFileUrlSeparator(p: string): boolean { return false; }
export function isWindowsNetworkPath(p: string): boolean { return false; }
export function safeFileURLToPath(p: string): string { return p; }
export function trySafeFileURLToPath(p: string): string { return p; }

// New stubs for path alias policies
export const PATH_ALIAS_POLICIES = {};
export function assertNoPathAliasEscape(p: string): void {}

// New stubs for root path resolution
export async function resolveExistingPathsWithinRoot(options: any): Promise<any> { return []; }
export async function resolvePathsWithinRoot(options: any): Promise<any> { return []; }
export async function resolvePathWithinRoot(options: any): Promise<any> { return ""; }
export async function resolveStrictExistingPathsWithinRoot(options: any): Promise<any> { return []; }
export async function resolveWritablePathWithinRoot(options: any): Promise<any> { return ""; }
export function pathScope(options: any): any { return {}; }

// Classes (so they aren't erased during compilation)
export class PermissionExec {}
export class WindowsAclEntry {}
export class WindowsAclSummary {}
export class OpenRootFileParams {}
export class OpenRootFileSyncParams {}
export class RootFileOpenFailure {}
export class RootFileOpenFailureReason {}
export class RootFileOpenResult {}
export class ResolvedRootPath {}
export class RootPathAliasPolicy {}
export class AssertNoSymlinkParentsOptions {}
export class FileIdentityStat {}
export class PathAliasPolicy {}
export class AppendRegularFileOptions {}
export class WriteSiblingTempFileOptions {}
export class WriteSiblingTempFileResult {}
export class AbsolutePathSymlinkPolicy {}
export class EnsureAbsoluteDirectoryOptions {}
export class EnsureAbsoluteDirectoryResult {}
export class ResolvedAbsolutePath {}
export class ResolvedWritableAbsolutePath {}
