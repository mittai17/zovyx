export interface ReadResult {
    buffer: Buffer;
    realPath?: string;
}
export interface OpenResult {
    handle: any;
    realPath: string;
}
export declare class Root {
    readonly rootDir: string;
    constructor(rootDir: string);
    resolve(relativePath: string): Promise<string>;
    read(relativePath: string, options?: any): Promise<ReadResult>;
    write(relativePath: string, data: any, options?: any): Promise<void>;
    writeJson(relativePath: string, data: any, options?: any): Promise<void>;
    readJson(relativePath: string, options?: any): Promise<any>;
    exists(relativePath: string): Promise<boolean>;
}
export declare function root(rootDir: string): Promise<Root>;
export declare function openLocalFileSafely(absPath: string, options?: any): Promise<OpenResult>;
export declare function readLocalFileSafely(absPath: string, options?: any): Promise<ReadResult>;
export declare function resolveOpenedFileRealPathForHandle(handle: any): string;
