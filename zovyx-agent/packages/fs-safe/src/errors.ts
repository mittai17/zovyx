export type FsSafeErrorCode = "not-found" | "path-mismatch" | "permission-denied" | "invalid-argument" | "timeout" | "unknown";

export class FsSafeError extends Error {
  constructor(public readonly code: FsSafeErrorCode, message: string) {
    super(message);
    this.name = "FsSafeError";
  }
}
