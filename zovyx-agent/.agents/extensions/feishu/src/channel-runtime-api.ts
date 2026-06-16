// Feishu API module exposes the plugin public contract.
export type {
  ChannelMessageActionName,
  ChannelMeta,
  ChannelPlugin,
  ClawdbotConfig,
} from "../runtime-api.js";

export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/account-resolution";
export { createActionGate } from "zuvix/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "zuvix/plugin-sdk/channel-config-primitives";
export {
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "zuvix/plugin-sdk/status-helpers";
export { PAIRING_APPROVED_MESSAGE } from "zuvix/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
