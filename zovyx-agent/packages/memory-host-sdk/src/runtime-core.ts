// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/zuvix-runtime-agent.js";
export { resolveCronStyleNow } from "./host/zuvix-runtime-agent.js";
export { DEFAULT_AGENT_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/zuvix-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/zuvix-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/zuvix-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/zuvix-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/zuvix-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/zuvix-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/zuvix-runtime-config.js";
export { resolveStateDir } from "./host/zuvix-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/zuvix-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/zuvix-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/zuvix-runtime-memory.js";
export { parseAgentSessionKey } from "./host/zuvix-runtime-agent.js";
export type { ZuvixConfig } from "./host/zuvix-runtime-config.js";
export type { MemoryCitationsMode } from "./host/zuvix-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/zuvix-runtime-memory.js";
export type { ZuvixPluginApi } from "./host/zuvix-runtime-memory.js";
