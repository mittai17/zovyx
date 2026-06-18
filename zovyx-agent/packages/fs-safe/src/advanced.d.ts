export declare function findExistingAncestor(dirPath: string): Promise<string | null>;
export declare function ensureDirectoryWithinRoot(options: {
    rootDir: string;
    requestedPath: string;
    scopeLabel?: string;
    mode?: number;
}): Promise<{
    ok: true;
    path: string;
} | {
    ok: false;
    error: string;
}>;
export declare function writeViaSiblingTempPath(options: {
    rootDir: string;
    targetPath: string;
    writeTemp: (tempPath: string) => Promise<void>;
    fallbackFileName?: string;
    tempPrefix?: string;
}): Promise<void>;
export declare function assertAbsolutePathInput(dirPath: string): void;
export declare function canonicalPathFromExistingAncestor(dirPath: string): string;
export declare function resolveAbsolutePathForRead(dirPath: string, options?: any): Promise<string>;
export declare function resolveAbsolutePathForWrite(dirPath: string, options?: any): Promise<string>;
export declare function pathExists(dirPath: string): Promise<boolean>;
export declare function pathExistsSync(dirPath: string): boolean;
export declare function movePathToTrash(dirPath: string, options?: any): Promise<void>;
export declare function readLocalFileFromRoots(paths: string[], ...args: any[]): Promise<any>;
export declare function resolveLocalPathFromRootsSync(paths: string[], ...args: any[]): any;
export declare function appendRegularFile(dirPath: string, data: any): Promise<void>;
export declare function appendRegularFileSync(dirPath: string, data: any): void;
export declare function readRegularFile(options: {
    filePath: string;
    maxBytes?: number;
}): Promise<{
    buffer: Buffer;
}>;
export declare function readRegularFileSync(dirPath: string): Buffer;
export declare function resolveRegularFileAppendFlags(options: any): any;
export interface RegularFileStatResult {
    missing: boolean;
    stat?: {
        size: number;
        mtimeMs: number;
        isDirectory: () => boolean;
    };
}
export declare function statRegularFile(dirPath: string): Promise<RegularFileStatResult>;
export declare function statRegularFileSync(dirPath: string): RegularFileStatResult;
export declare function sanitizeUntrustedFileName(name: string): string;
export declare function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T>;
export declare function assertNoSymlinkParents(options: {
    rootDir: string;
    targetPath: string;
}): Promise<void>;
export declare function createAsyncLock(name: string): any;
export declare function formatPosixMode(mode: number): string;
export declare function createIcaclsResetCommand(p: string): string;
export declare function formatIcaclsResetCommand(p: string): string;
export declare function formatWindowsAclSummary(summary: any): string;
export declare function inspectWindowsAcl(p: string, exec?: any): Promise<any>;
export declare function parseIcaclsOutput(stdout: string): any[];
export declare function resolveWindowsUserPrincipal(exec?: any): Promise<string>;
export declare function summarizeWindowsAcl(entries: any[]): any;
export declare function canUseRootFileOpen(options?: any): boolean;
export declare function matchRootFileOpenFailure(err: any): boolean;
export declare function openRootFile(options: any): Promise<any>;
export declare function openRootFileSync(options: any): any;
export declare const ROOT_PATH_ALIAS_POLICIES: {};
export declare function resolvePathViaExistingAncestorSync(p: string): string;
export declare function resolveRootPath(options: any): Promise<any>;
export declare function resolveRootPathSync(options: any): any;
export declare function assertNoHardlinkedFinalPath(p: string): Promise<void>;
export declare function assertNoSymlinkParentsSync(options: any): void;
export declare function sameFileIdentity(a: any, b: any): boolean;
export declare function writeSiblingTempFile(options: any): Promise<any>;
export declare function assertCanonicalPathWithinBase(a: string, b: string): void;
export declare function resolveSafeInstallDir(options: any): string;
export declare function safeDirName(p: string): string;
export declare function safePathSegmentHashed(p: string): string;
export declare function assertNoWindowsNetworkPath(p: string): void;
export declare function basenameFromMediaSource(p: string): string;
export declare function hasEncodedFileUrlSeparator(p: string): boolean;
export declare function isWindowsNetworkPath(p: string): boolean;
export declare function safeFileURLToPath(p: string): string;
export declare function trySafeFileURLToPath(p: string): string;
export declare const PATH_ALIAS_POLICIES: {};
export declare function assertNoPathAliasEscape(p: string): void;
export declare function resolveExistingPathsWithinRoot(options: any): Promise<any>;
export declare function resolvePathsWithinRoot(options: any): Promise<any>;
export declare function resolvePathWithinRoot(options: any): Promise<any>;
export declare function resolveStrictExistingPathsWithinRoot(options: any): Promise<any>;
export declare function resolveWritablePathWithinRoot(options: any): Promise<any>;
export declare function pathScope(options: any): any;
export declare class PermissionExec {
}
export declare class WindowsAclEntry {
}
export declare class WindowsAclSummary {
}
export declare class OpenRootFileParams {
}
export declare class OpenRootFileSyncParams {
}
export declare class RootFileOpenFailure {
}
export declare class RootFileOpenFailureReason {
}
export declare class RootFileOpenResult {
}
export declare class ResolvedRootPath {
}
export declare class RootPathAliasPolicy {
}
export declare class AssertNoSymlinkParentsOptions {
}
export declare class FileIdentityStat {
}
export declare class PathAliasPolicy {
}
export declare class AppendRegularFileOptions {
}
export declare class WriteSiblingTempFileOptions {
}
export declare class WriteSiblingTempFileResult {
}
export declare class AbsolutePathSymlinkPolicy {
}
export declare class EnsureAbsoluteDirectoryOptions {
}
export declare class EnsureAbsoluteDirectoryResult {
}
export declare class ResolvedAbsolutePath {
}
export declare class ResolvedWritableAbsolutePath {
}
