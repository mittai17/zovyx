// Mattermost API module exposes the plugin public contract.
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChatType,
  HistoryEntry,
  ZuvixConfig,
  ZuvixPluginApi,
  ReplyPayload,
} from "zuvix/plugin-sdk/core";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export { buildAgentMediaPayload } from "zuvix/plugin-sdk/agent-media-payload";
export { resolveAllowlistMatchSimple } from "zuvix/plugin-sdk/allow-from";
export { logInboundDrop } from "zuvix/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-feedback";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
} from "zuvix/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "zuvix/plugin-sdk/models-provider-runtime";
export { isDangerousNameMatchingEnabled } from "zuvix/plugin-sdk/dangerous-name-runtime";
export {
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "zuvix/plugin-sdk/runtime-group-policy";
export { resolveChannelMediaMaxBytes } from "zuvix/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildInboundHistoryFromMap,
  buildPendingHistoryContextFromMap,
  recordPendingHistoryEntryIfEnabled,
} from "zuvix/plugin-sdk/reply-history";
export { registerPluginHttpRoute } from "zuvix/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "zuvix/plugin-sdk/webhook-ingress";
export {
  isTrustedProxyAddress,
  parseStrictPositiveInteger,
  resolveClientIp,
} from "zuvix/plugin-sdk/core";
export { parseTcpPort } from "zuvix/plugin-sdk/number-runtime";
