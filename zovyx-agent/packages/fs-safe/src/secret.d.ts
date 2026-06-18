export declare const DEFAULT_SECRET_FILE_MAX_BYTES: number;
export declare const PRIVATE_SECRET_DIR_MODE = 448;
export declare const PRIVATE_SECRET_FILE_MODE = 384;
export type SecretFileReadOptions = {
    maxBytes?: number;
};
export declare function readSecretFileSync(filePath: string, label: string, options?: SecretFileReadOptions): string;
export declare function tryReadSecretFileSync(filePath: string, label: string, options?: SecretFileReadOptions): string | null;
export declare function writeSecretFileAtomic(filePath: string, data: string | Buffer, options?: any): void;
