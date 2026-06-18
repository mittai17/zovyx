export interface MovePathWithCopyFallbackOptions {
    from: string;
    to: string;
}
export declare function movePathWithCopyFallback(options: MovePathWithCopyFallbackOptions): Promise<void>;
export declare function replaceFileAtomic(targetPath: string, data: string | Buffer, options?: any): Promise<void>;
export declare function replaceFileAtomicSync(targetPath: string, data: string | Buffer, options?: any): void;
export declare function replaceDirectoryAtomic(targetPath: string, newDirPath: string, options?: any): Promise<void>;
export type ReplaceDirectoryAtomicOptions = any;
export type ReplaceFileAtomicFileSystem = any;
export type ReplaceFileAtomicOptions = any;
export type ReplaceFileAtomicResult = any;
export type ReplaceFileAtomicSyncFileSystem = any;
export type ReplaceFileAtomicSyncOptions = any;
export type MovePathWithCopyFallbackOptionsBase = MovePathWithCopyFallbackOptions;
export declare const movePathWithCopyFallbackBase: typeof movePathWithCopyFallback;
export declare const replaceFileAtomicBase: typeof replaceFileAtomic;
