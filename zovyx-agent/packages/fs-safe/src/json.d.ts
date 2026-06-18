export declare class JsonFileReadError extends Error {
    readonly filePath: string;
    readonly operation: string;
    constructor(filePath: string, operation: string, cause?: any);
}
export declare function readJson<T>(filePath: string): Promise<T>;
export declare function readJsonIfExists<T>(filePath: string): Promise<T | null>;
export declare function readJsonSync<T>(filePath: string): T;
export declare function readRootJsonSync<T>(filePath: string): T;
export declare function readRootStructuredFileSync<T>(filePath: string): T;
export declare function tryReadJsonSync(filePath: string): any;
export declare function writeJson(filePath: string, data: any): Promise<void>;
export declare function writeJsonSync(filePath: string, data: any): void;
export declare function readRootJsonObjectSync(filePath: string): any;
