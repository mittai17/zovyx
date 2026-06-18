import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

export interface WalkDirectoryEntry {
  path: string;
  name: string;
  kind: "directory" | "file";
}

export interface WalkDirectoryOptions {
  symlinks?: "skip" | "follow";
  descend?: (entry: WalkDirectoryEntry) => boolean;
  include?: (entry: WalkDirectoryEntry) => boolean;
}

export interface WalkDirectoryResult {
  entries: WalkDirectoryEntry[];
}

export async function walkDirectory(
  dir: string,
  options?: WalkDirectoryOptions
): Promise<WalkDirectoryResult> {
  const result: WalkDirectoryEntry[] = [];

  async function walk(currentDir: string) {
    let files: string[];
    try {
      files = await fsPromises.readdir(currentDir);
    } catch {
      return;
    }

    for (const name of files) {
      const fullPath = path.join(currentDir, name);
      let stat: fs.Stats;
      try {
        stat = await fsPromises.lstat(fullPath);
      } catch {
        continue;
      }

      if (stat.isSymbolicLink() && options?.symlinks === "skip") {
        continue;
      }

      const isDir = stat.isDirectory();
      const kind = isDir ? "directory" : "file";
      const entry: WalkDirectoryEntry = { path: fullPath, name, kind };

      const shouldInclude = !options?.include || options.include(entry);
      if (shouldInclude) {
        result.push(entry);
      }

      if (isDir) {
        const shouldDescend = !options?.descend || options.descend(entry);
        if (shouldDescend) {
          await walk(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return { entries: result };
}

export function walkDirectorySync(
  dir: string,
  options?: WalkDirectoryOptions
): WalkDirectoryResult {
  const result: WalkDirectoryEntry[] = [];

  function walk(currentDir: string) {
    let files: string[];
    try {
      files = fs.readdirSync(currentDir);
    } catch {
      return;
    }

    for (const name of files) {
      const fullPath = path.join(currentDir, name);
      let stat: fs.Stats;
      try {
        stat = fs.lstatSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isSymbolicLink() && options?.symlinks === "skip") {
        continue;
      }

      const isDir = stat.isDirectory();
      const kind = isDir ? "directory" : "file";
      const entry: WalkDirectoryEntry = { path: fullPath, name, kind };

      const shouldInclude = !options?.include || options.include(entry);
      if (shouldInclude) {
        result.push(entry);
      }

      if (isDir) {
        const shouldDescend = !options?.descend || options.descend(entry);
        if (shouldDescend) {
          walk(fullPath);
        }
      }
    }
  }

  walk(dir);
  return { entries: result };
}
