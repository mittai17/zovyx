// Whatsapp API module exposes the plugin public contract.
export { resolveIdentityNamePrefix } from "zuvix/plugin-sdk/agent-runtime";
export { formatInboundEnvelope } from "zuvix/plugin-sdk/channel-inbound";
export { resolveInboundSessionEnvelopeContext } from "zuvix/plugin-sdk/channel-inbound";
export { toLocationContext } from "zuvix/plugin-sdk/channel-inbound";
export {
  createChannelMessageReplyPipeline,
  resolveChannelMessageSourceReplyDeliveryMode,
} from "zuvix/plugin-sdk/channel-outbound";
export {
  isControlCommandMessage,
  shouldComputeCommandAuthorized,
} from "zuvix/plugin-sdk/command-detection";
export { resolveChannelContextVisibilityMode } from "../config.runtime.js";
export { getAgentScopedMediaLocalRoots } from "zuvix/plugin-sdk/media-runtime";
export type LoadConfigFn = typeof import("../config.runtime.js").getRuntimeConfig;
export {
  buildHistoryContextFromEntries,
  type HistoryEntry,
} from "zuvix/plugin-sdk/reply-history";
export { resolveSendableOutboundReplyParts } from "zuvix/plugin-sdk/reply-payload";
export {
  dispatchReplyWithBufferedBlockDispatcher,
  finalizeInboundContext,
  resolveChunkMode,
  resolveTextChunkLimit,
  type getReplyFromConfig,
  type ReplyPayload,
} from "zuvix/plugin-sdk/reply-runtime";
export {
  resolveInboundLastRouteSessionKey,
  type resolveAgentRoute,
} from "zuvix/plugin-sdk/routing";
export { logVerbose, shouldLogVerbose, type getChildLogger } from "zuvix/plugin-sdk/runtime-env";
export { resolvePinnedMainDmOwnerFromAllowlist } from "zuvix/plugin-sdk/security-runtime";
export { resolveMarkdownTableMode } from "zuvix/plugin-sdk/markdown-table-runtime";
export { jidToE164, normalizeE164 } from "../../text-runtime.js";
