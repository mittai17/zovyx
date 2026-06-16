// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  ZuvixConfig,
  ZuvixPluginApi,
  PluginRuntime,
} from "zuvix/plugin-sdk/core";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export type { ReplyPayload } from "zuvix/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "zuvix/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "zuvix/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "zuvix/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "zuvix/plugin-sdk/channel-status";
export { createAccountStatusSink } from "zuvix/plugin-sdk/channel-outbound";
export { buildAgentMediaPayload } from "zuvix/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "zuvix/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "zuvix/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "zuvix/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "zuvix/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "zuvix/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "zuvix/plugin-sdk/channel-inbound";
export { logInboundDrop } from "zuvix/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export { rawDataToString } from "zuvix/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "zuvix/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "zuvix/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "zuvix/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "zuvix/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "zuvix/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "zuvix/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "zuvix/plugin-sdk/media-runtime";
export { normalizeProviderId } from "zuvix/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
