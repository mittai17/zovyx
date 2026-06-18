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
export declare function walkDirectory(dir: string, options?: WalkDirectoryOptions): Promise<WalkDirectoryResult>;
export declare function walkDirectorySync(dir: string, options?: WalkDirectoryOptions): WalkDirectoryResult;
