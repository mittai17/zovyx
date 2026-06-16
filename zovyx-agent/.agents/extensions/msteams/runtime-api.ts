// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/account-id";
export type { AllowlistMatch } from "zuvix/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "zuvix/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "zuvix/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "zuvix/plugin-sdk/channel-core";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "zuvix/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "zuvix/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "zuvix/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsCloudName,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  ZuvixConfig,
} from "zuvix/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "zuvix/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "zuvix/plugin-sdk/runtime-group-policy";
export { withFileLock } from "zuvix/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "zuvix/plugin-sdk/channel-outbound";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "zuvix/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "zuvix/plugin-sdk/channel-inbound";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export { buildMediaPayload } from "zuvix/plugin-sdk/reply-payload";
export type { ReplyPayload } from "zuvix/plugin-sdk/reply-payload";
export type { PluginRuntime } from "zuvix/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export type { SsrFPolicy } from "zuvix/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "zuvix/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "zuvix/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "zuvix/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
