import fsSync from "node:fs";

export const DEFAULT_SECRET_FILE_MAX_BYTES = 10 * 1024;
export const PRIVATE_SECRET_DIR_MODE = 0o700;
export const PRIVATE_SECRET_FILE_MODE = 0o600;

export type SecretFileReadOptions = {
  maxBytes?: number;
};

export function readSecretFileSync(filePath: string, label: string, options?: SecretFileReadOptions): string {
  const content = fsSync.readFileSync(filePath, "utf-8");
  if (options?.maxBytes && content.length > options.maxBytes) {
    throw new Error(`${label} file exceeds max size limit`);
  }
  return content.trim();
}

export function tryReadSecretFileSync(filePath: string, label: string, options?: SecretFileReadOptions): string | null {
  try {
    return readSecretFileSync(filePath, label, options);
  } catch {
    return null;
  }
}

export function writeSecretFileAtomic(filePath: string, data: string | Buffer, options?: any): void {
  const tempPath = `${filePath}.tmp-${Math.random().toString(36).slice(2)}`;
  fsSync.writeFileSync(tempPath, data, { mode: PRIVATE_SECRET_FILE_MODE });
  fsSync.renameSync(tempPath, filePath);
}
