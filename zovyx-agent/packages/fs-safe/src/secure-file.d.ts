import type { ReadResult } from "./root.js";
export type SecureFileReadOptions = {
    maxBytes?: number;
};
export type SecureFileReadResult = ReadResult;
export declare function readSecureFile(absPath: string, options?: SecureFileReadOptions): Promise<SecureFileReadResult>;
export declare function getSecureTemporaryWorkspace(options?: any): Promise<any>;
