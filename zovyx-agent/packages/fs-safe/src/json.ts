import fs from "node:fs/promises";
import fsSync from "node:fs";

export class JsonFileReadError extends Error {
  constructor(public readonly filePath: string, public readonly operation: string, cause?: any) {
    super(`Failed to ${operation} JSON file at ${filePath}${cause ? `: ${cause.message}` : ""}`);
    this.name = "JsonFileReadError";
  }
}

export async function readJson<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export function readJsonSync<T>(filePath: string): T {
  const content = fsSync.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function readRootJsonSync<T>(filePath: string): T {
  return readJsonSync(filePath);
}

export function readRootStructuredFileSync<T>(filePath: string): T {
  return readJsonSync(filePath);
}

export function tryReadJsonSync(filePath: string): any {
  try {
    return readJsonSync(filePath);
  } catch {
    return null;
  }
}

export async function writeJson(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export function writeJsonSync(filePath: string, data: any): void {
  fsSync.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readRootJsonObjectSync(filePath: string): any {
  return readJsonSync(filePath);
}
