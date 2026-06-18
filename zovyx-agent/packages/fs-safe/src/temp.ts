import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";

export class TempWorkspace {
  path!: string;
  cleanup!: () => Promise<void>;
}

export class TempWorkspaceSync {
  path!: string;
  cleanup!: () => void;
}

export class TempWorkspaceOptions {
  prefix?: string;
  dir?: string;
}

export async function tempWorkspace(options?: TempWorkspaceOptions): Promise<TempWorkspace> {
  const tmpDir = options?.dir || os.tmpdir();
  const name = `${options?.prefix || "zuvix-tmp"}-${Math.random().toString(36).slice(2)}`;
  const fullPath = path.join(tmpDir, name);
  await fs.mkdir(fullPath, { recursive: true });
  return {
    path: fullPath,
    async cleanup() {
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  };
}

export function tempWorkspaceSync(options?: TempWorkspaceOptions): TempWorkspaceSync {
  const tmpDir = options?.dir || os.tmpdir();
  const name = `${options?.prefix || "zuvix-tmp"}-${Math.random().toString(36).slice(2)}`;
  const fullPath = path.join(tmpDir, name);
  fsSync.mkdirSync(fullPath, { recursive: true });
  return {
    path: fullPath,
    cleanup() {
      fsSync.rmSync(fullPath, { recursive: true, force: true });
    }
  };
}

export async function withTempWorkspace<T>(
  fn: (workspace: TempWorkspace) => Promise<T>,
  options?: TempWorkspaceOptions
): Promise<T> {
  const ws = await tempWorkspace(options);
  try {
    return await fn(ws);
  } finally {
    await ws.cleanup();
  }
}

export function withTempWorkspaceSync<T>(
  fn: (workspace: TempWorkspaceSync) => T,
  options?: TempWorkspaceOptions
): T {
  const ws = tempWorkspaceSync(options);
  try {
    return fn(ws);
  } finally {
    ws.cleanup();
  }
}
