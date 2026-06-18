import path from "node:path";
import fs from "node:fs";

export function isPathInside(parent: string, child: string): boolean {
  const isWindows = process.platform === "win32";
  const p = isWindows ? path.win32 : path.posix;
  
  let pParent = p.resolve(parent);
  let pChild = p.resolve(child);
  
  if (isWindows) {
    pParent = pParent.toLowerCase();
    pChild = pChild.toLowerCase();
  }
  
  if (pParent === pChild) {
    return true;
  }
  
  const relation = p.relative(pParent, pChild);
  const isEscaped = relation === ".." || relation.startsWith(".." + p.sep);
  return relation.length > 0 && !isEscaped && !p.isAbsolute(relation);
}

export function isPathInsideWithRealpath(parent: string, child: string): boolean {
  return isPathInside(parent, child);
}

export function normalizeWindowsPathForComparison(input: string): string {
  let normalized = input;
  if (normalized.toLowerCase().startsWith("\\\\?\\unc\\")) {
    normalized = "\\\\" + normalized.slice(8);
  } else if (normalized.startsWith("\\\\?\\")) {
    normalized = normalized.slice(4);
  }
  return normalized.replace(/\//g, "\\").toLowerCase();
}

export function isNodeError(value: any): value is { code: string } {
  return typeof value === "object" && value !== null && typeof value.code === "string";
}

export function hasNodeErrorCode(value: any, code: string): boolean {
  return isNodeError(value) && value.code === code;
}

export function isNotFoundPathError(value: any): boolean {
  return isNodeError(value) && (value.code === "ENOENT" || value.code === "ENOTDIR");
}

export function isSymlinkOpenError(value: any): boolean {
  return isNodeError(value) && (value.code === "ELOOP" || value.code === "EINVAL" || value.code === "ENOTSUP");
}

export function isWithinDir(parent: string, child: string): boolean {
  return isPathInside(parent, child);
}

export function resolveSafeBaseDir(baseDir: string): string {
  return path.resolve(baseDir);
}

export function resolveSafeRelativePath(baseDir: string, targetPath: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return path.relative(resolvedBase, resolvedTarget);
}

export function safeRealpathSync(p: string): string {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
}

export function safeStatSync(p: string): fs.Stats {
  return fs.statSync(p);
}

export function splitSafeRelativePath(p: string): string[] {
  return p.split(/[\\/]/).filter(Boolean);
}
