import path from "node:path";
import fs from "node:fs/promises";

// From archive-path.ts
export function isWindowsDrivePath(p: string): boolean {
  return /^[a-zA-Z]:/.test(p);
}
export function normalizeArchiveEntryPath(p: string): string {
  return p.replace(/\\/g, "/");
}
export function resolveArchiveOutputPath(rootDir: string, p: string): string {
  return path.resolve(rootDir, p);
}
export function stripArchivePath(p: string): string {
  return p;
}
export function validateArchiveEntryPath(p: string): boolean {
  return true;
}

// From archive.ts
export const ARCHIVE_LIMIT_ERROR_CODE = "ARCHIVE_LIMIT_ERROR";
export class ArchiveLimitError extends Error {
  code = ARCHIVE_LIMIT_ERROR_CODE;
}
export class ArchiveSecurityError extends Error {}
export const DEFAULT_MAX_ARCHIVE_BYTES_ZIP = 100 * 1024 * 1024;
export const DEFAULT_MAX_ENTRIES = 10000;
export const DEFAULT_MAX_EXTRACTED_BYTES = 1000 * 1024 * 1024;
export const DEFAULT_MAX_ENTRY_BYTES = 100 * 1024 * 1024;

export function createArchiveSymlinkTraversalError(message: string): Error {
  return new Error(message);
}
export function createTarEntryPreflightChecker(): any {
  return () => {};
}
export async function extractArchive(options: any): Promise<void> {
  // stub
}
export async function loadZipArchiveWithPreflight(options: any): Promise<any> {
  return {};
}
export async function mergeExtractedTreeIntoDestination(src: string, dest: string): Promise<void> {
  await fs.cp(src, dest, { recursive: true });
}
export async function prepareArchiveDestinationDir(dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
}
export function prepareArchiveOutputPath(p: string): string {
  return p;
}
export async function readZipCentralDirectoryEntryCount(p: string): Promise<number> {
  return 0;
}
export function resolveArchiveKind(p: string): any {
  return "zip";
}
export function resolvePackedRootDir(p: string): string {
  return "";
}
export async function withStagedArchiveDestination(options: any): Promise<any> {
  // stub
}

export type ArchiveExtractLimits = any;
export type ArchiveKind = any;
export type ArchiveLimitErrorCode = any;
export type ArchiveLogger = any;
export type ArchiveSecurityErrorCode = any;
export type TarEntryInfo = any;
