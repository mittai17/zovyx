import { Root } from "./root.js";
export interface FileStore {
    root(): Promise<Root>;
}
export interface FileStoreSync {
    root(): Root;
}
export declare function fileStore(options: {
    rootDir: string;
    private?: boolean;
}): FileStore;
export declare function fileStoreSync(options: {
    rootDir: string;
    private?: boolean;
}): FileStoreSync;
export type FileStoreOptions = any;
export type FileStorePruneOptions = any;
export type FileStoreWriteOptions = any;
