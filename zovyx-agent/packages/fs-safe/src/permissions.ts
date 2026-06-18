import fs from "node:fs/promises";

export function formatPermissionDetail(detail: any): string {
  return "";
}

export function formatPermissionRemediation(detail: any): string {
  return "";
}

export async function inspectPathPermissions(p: string, options?: any): Promise<any> {
  return {};
}

export async function safeStat(p: string): Promise<any> {
  try {
    return await fs.lstat(p);
  } catch {
    return null;
  }
}

export class PermissionCheck {}
export class PermissionCheckOptions {}
