export type FsSafeErrorCode = "not-found" | "path-mismatch" | "permission-denied" | "invalid-argument" | "timeout" | "unknown";
export declare class FsSafeError extends Error {
    readonly code: FsSafeErrorCode;
    constructor(code: FsSafeErrorCode, message: string);
}
