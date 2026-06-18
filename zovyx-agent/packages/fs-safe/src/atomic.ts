import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

export interface MovePathWithCopyFallbackOptions {
  from: string;
  to: string;
}

export async function movePathWithCopyFallback(options: MovePathWithCopyFallbackOptions): Promise<void> {
  try {
    await fs.rename(options.from, options.to);
  } catch (err) {
    await fs.cp(options.from, options.to, { recursive: true });
    await fs.rm(options.from, { recursive: true, force: true });
  }
}

export async function replaceFileAtomic(
  targetPath: string,
  data: string | Buffer,
  options?: any
): Promise<void> {
  const dir = path.dirname(targetPath);
  const tempPath = path.join(dir, `.atomic-tmp-${Math.random().toString(36).slice(2)}`);
  await fs.writeFile(tempPath, data);
  await fs.rename(tempPath, targetPath);
}

export function replaceFileAtomicSync(
  targetPath: string,
  data: string | Buffer,
  options?: any
): void {
  const dir = path.dirname(targetPath);
  const tempPath = path.join(dir, `.atomic-tmp-${Math.random().toString(36).slice(2)}`);
  fsSync.writeFileSync(tempPath, data);
  fsSync.renameSync(tempPath, targetPath);
}

export async function replaceDirectoryAtomic(
  targetPath: string,
  newDirPath: string,
  options?: any
): Promise<void> {
  await fs.rm(targetPath, { recursive: true, force: true });
  await fs.rename(newDirPath, targetPath);
}

export type ReplaceDirectoryAtomicOptions = any;
export type ReplaceFileAtomicFileSystem = any;
export type ReplaceFileAtomicOptions = any;
export type ReplaceFileAtomicResult = any;
export type ReplaceFileAtomicSyncFileSystem = any;
export type ReplaceFileAtomicSyncOptions = any;
export type MovePathWithCopyFallbackOptionsBase = MovePathWithCopyFallbackOptions;
export const movePathWithCopyFallbackBase = movePathWithCopyFallback;
export const replaceFileAtomicBase = replaceFileAtomic;
