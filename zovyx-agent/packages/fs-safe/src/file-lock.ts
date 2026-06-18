export interface FileLockHeldEntry {
  path: string;
  token: string;
}

export interface FileLockManager {
  acquire(p: string, options?: any): Promise<FileLockHeldEntry>;
  release(entry: FileLockHeldEntry): Promise<void>;
  releaseAll(): Promise<void>;
}

export function createFileLockManager(): FileLockManager {
  const held = new Map<string, string>();
  return {
    async acquire(p: string, options?: any): Promise<FileLockHeldEntry> {
      const token = Math.random().toString();
      held.set(p, token);
      return { path: p, token };
    },
    async release(entry: FileLockHeldEntry): Promise<void> {
      if (held.get(entry.path) === entry.token) {
        held.delete(entry.path);
      }
    },
    async releaseAll(): Promise<void> {
      held.clear();
    }
  };
}

export async function acquireFileLock(filePath: string, options?: any): Promise<{ lockPath: string; release: () => Promise<void> }> {
  return {
    lockPath: `${filePath}.lock`,
    async release() {}
  };
}

export async function drainFileLockManagerForTest(a?: any, b?: any): Promise<void> {
  return Promise.resolve();
}

export function resetFileLockManagerForTest(a?: any, b?: any): void {
  // stub
}
