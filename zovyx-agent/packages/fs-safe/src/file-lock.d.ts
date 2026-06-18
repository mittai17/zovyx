export interface FileLockHeldEntry {
    path: string;
    token: string;
}
export interface FileLockManager {
    acquire(p: string, options?: any): Promise<FileLockHeldEntry>;
    release(entry: FileLockHeldEntry): Promise<void>;
    releaseAll(): Promise<void>;
}
export declare function createFileLockManager(): FileLockManager;
export declare function acquireFileLock(filePath: string, options?: any): Promise<{
    lockPath: string;
    release: () => Promise<void>;
}>;
export declare function drainFileLockManagerForTest(a?: any, b?: any): Promise<void>;
export declare function resetFileLockManagerForTest(a?: any, b?: any): void;
