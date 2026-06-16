// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/zuvix-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/zuvix-runtime-agent.js";
export { parseDurationMs } from "./host/zuvix-runtime-config.js";
export { loadConfig } from "./host/zuvix-runtime-config.js";
export { resolveStateDir } from "./host/zuvix-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/zuvix-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/zuvix-runtime-config.js";
export { root } from "./host/zuvix-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/zuvix-runtime-io.js";
export { detectMime } from "./host/zuvix-runtime-io.js";
export { resolveGlobalSingleton } from "./host/zuvix-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/zuvix-runtime-session.js";
export { splitShellArgs } from "./host/zuvix-runtime-io.js";
export { runTasksWithConcurrency } from "./host/zuvix-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/zuvix-runtime-io.js";
export type { ZuvixConfig } from "./host/zuvix-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/zuvix-runtime-config.js";
export type { SecretInput } from "./host/zuvix-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/zuvix-runtime-config.js";
export type { MemorySearchConfig } from "./host/zuvix-runtime-config.js";
