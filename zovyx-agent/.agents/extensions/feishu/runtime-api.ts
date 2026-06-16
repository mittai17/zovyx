// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  ZuvixConfig,
  ZuvixPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "zuvix/plugin-sdk/core";
export type { ZuvixConfig as ClawdbotConfig } from "zuvix/plugin-sdk/core";
export type RuntimeEnv = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  exit: (code: number) => void;
};
export type { GroupToolPolicyConfig } from "zuvix/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "zuvix/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "zuvix/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "zuvix/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "zuvix/plugin-sdk/channel-outbound";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "zuvix/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "zuvix/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "zuvix/plugin-sdk/json-store";
export { normalizeAgentId } from "zuvix/plugin-sdk/routing";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "zuvix/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
