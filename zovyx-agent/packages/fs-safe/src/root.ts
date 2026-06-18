import fs from "node:fs/promises";
import path from "node:path";
import { isPathInside } from "./path.js";

export interface ReadResult {
  buffer: Buffer;
  realPath?: string;
}

export interface OpenResult {
  handle: any;
  realPath: string;
}

export class Root {
  constructor(public readonly rootDir: string) {}

  async resolve(relativePath: string): Promise<string> {
    const absPath = path.resolve(this.rootDir, relativePath);
    if (!isPathInside(this.rootDir, absPath)) {
      throw new Error(`Path escape detected: ${relativePath} is outside ${this.rootDir}`);
    }
    return absPath;
  }

  async read(relativePath: string, options?: any): Promise<ReadResult> {
    const absPath = await this.resolve(relativePath);
    const buffer = await fs.readFile(absPath);
    return { buffer };
  }

  async write(relativePath: string, data: any, options?: any): Promise<void> {
    const absPath = await this.resolve(relativePath);
    if (options?.mkdir) {
      await fs.mkdir(path.dirname(absPath), { recursive: true });
    }
    await fs.writeFile(absPath, data, options);
  }

  async writeJson(relativePath: string, data: any, options?: any): Promise<void> {
    await this.write(relativePath, JSON.stringify(data, null, 2), options);
  }

  async readJson(relativePath: string, options?: any): Promise<any> {
    const result = await this.read(relativePath, options);
    return JSON.parse(result.buffer.toString("utf-8"));
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const absPath = await this.resolve(relativePath);
      await fs.access(absPath);
      return true;
    } catch {
      return false;
    }
  }
}

export async function root(rootDir: string): Promise<Root> {
  return new Root(path.resolve(rootDir));
}

export async function openLocalFileSafely(absPath: string, options?: any): Promise<OpenResult> {
  const handle = await fs.open(absPath, options?.flags || "r");
  return { handle, realPath: absPath };
}

export async function readLocalFileSafely(absPath: string, options?: any): Promise<ReadResult> {
  const buffer = await fs.readFile(absPath);
  return { buffer, realPath: absPath };
}

export function resolveOpenedFileRealPathForHandle(handle: any): string {
  return "";
}
