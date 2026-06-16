// Memory Core plugin module implements public artifacts behavior.
import {
  listMemoryHostPublicArtifacts,
  type MemoryPluginPublicArtifact,
} from "zuvix/plugin-sdk/memory-host-core";
import type { ZuvixConfig } from "../api.js";

export async function listMemoryCorePublicArtifacts(params: {
  cfg: ZuvixConfig;
}): Promise<MemoryPluginPublicArtifact[]> {
  return await listMemoryHostPublicArtifacts(params);
}
