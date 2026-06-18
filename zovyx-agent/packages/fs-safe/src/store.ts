import { Root, root } from "./root.js";

export interface FileStore {
  root(): Promise<Root>;
}
export interface FileStoreSync {
  root(): Root;
}

export function fileStore(options: { rootDir: string; private?: boolean }): FileStore {
  return {
    async root() {
      return root(options.rootDir);
    }
  };
}

export function fileStoreSync(options: { rootDir: string; private?: boolean }): FileStoreSync {
  return {
    root() {
      return new Root(options.rootDir);
    }
  };
}

export type FileStoreOptions = any;
export type FileStorePruneOptions = any;
export type FileStoreWriteOptions = any;
