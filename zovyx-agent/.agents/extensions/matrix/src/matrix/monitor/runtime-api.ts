// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "zuvix/plugin-sdk/channel-inbound";
export type { PluginRuntime, RuntimeLogger } from "zuvix/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "zuvix/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "zuvix/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "zuvix/plugin-sdk/channel-outbound";
export { formatLocationText, toLocationContext } from "zuvix/plugin-sdk/channel-inbound";
export { getAgentScopedMediaLocalRoots } from "zuvix/plugin-sdk/agent-media-payload";
export { logInboundDrop } from "zuvix/plugin-sdk/channel-inbound";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-outbound";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "zuvix/plugin-sdk/channel-targets";
