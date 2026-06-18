import fs from "node:fs/promises";
import type { ReadResult } from "./root.js";

export type SecureFileReadOptions = {
  maxBytes?: number;
};

export type SecureFileReadResult = ReadResult;

export async function readSecureFile(absPath: string, options?: SecureFileReadOptions): Promise<SecureFileReadResult> {
  const buffer = await fs.readFile(absPath);
  return { buffer, realPath: absPath };
}

export async function getSecureTemporaryWorkspace(options?: any): Promise<any> {
  return {
    path: "/tmp/zuvix-secure-tmp",
    async cleanup() {}
  };
}
