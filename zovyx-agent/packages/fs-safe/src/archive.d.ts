export declare function isWindowsDrivePath(p: string): boolean;
export declare function normalizeArchiveEntryPath(p: string): string;
export declare function resolveArchiveOutputPath(rootDir: string, p: string): string;
export declare function stripArchivePath(p: string): string;
export declare function validateArchiveEntryPath(p: string): boolean;
export declare const ARCHIVE_LIMIT_ERROR_CODE = "ARCHIVE_LIMIT_ERROR";
export declare class ArchiveLimitError extends Error {
    code: string;
}
export declare class ArchiveSecurityError extends Error {
}
export declare const DEFAULT_MAX_ARCHIVE_BYTES_ZIP: number;
export declare const DEFAULT_MAX_ENTRIES = 10000;
export declare const DEFAULT_MAX_EXTRACTED_BYTES: number;
export declare const DEFAULT_MAX_ENTRY_BYTES: number;
export declare function createArchiveSymlinkTraversalError(message: string): Error;
export declare function createTarEntryPreflightChecker(): any;
export declare function extractArchive(options: any): Promise<void>;
export declare function loadZipArchiveWithPreflight(options: any): Promise<any>;
export declare function mergeExtractedTreeIntoDestination(src: string, dest: string): Promise<void>;
export declare function prepareArchiveDestinationDir(dest: string): Promise<void>;
export declare function prepareArchiveOutputPath(p: string): string;
export declare function readZipCentralDirectoryEntryCount(p: string): Promise<number>;
export declare function resolveArchiveKind(p: string): any;
export declare function resolvePackedRootDir(p: string): string;
export declare function withStagedArchiveDestination(options: any): Promise<any>;
export type ArchiveExtractLimits = any;
export type ArchiveKind = any;
export type ArchiveLimitErrorCode = any;
export type ArchiveLogger = any;
export type ArchiveSecurityErrorCode = any;
export type TarEntryInfo = any;
