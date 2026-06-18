import fs from "node:fs";
export declare function isPathInside(parent: string, child: string): boolean;
export declare function isPathInsideWithRealpath(parent: string, child: string): boolean;
export declare function normalizeWindowsPathForComparison(input: string): string;
export declare function isNodeError(value: any): value is {
    code: string;
};
export declare function hasNodeErrorCode(value: any, code: string): boolean;
export declare function isNotFoundPathError(value: any): boolean;
export declare function isSymlinkOpenError(value: any): boolean;
export declare function isWithinDir(parent: string, child: string): boolean;
export declare function resolveSafeBaseDir(baseDir: string): string;
export declare function resolveSafeRelativePath(baseDir: string, targetPath: string): string;
export declare function safeRealpathSync(p: string): string;
export declare function safeStatSync(p: string): fs.Stats;
export declare function splitSafeRelativePath(p: string): string[];
