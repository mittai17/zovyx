// Irc API module exposes the plugin public contract.
export { createAccountStatusSink } from "zuvix/plugin-sdk/channel-outbound";
export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/account-id";
export type { ChannelPlugin } from "zuvix/plugin-sdk/channel-core";
export { PAIRING_APPROVED_MESSAGE } from "zuvix/plugin-sdk/channel-status";
export { buildBaseChannelStatusSummary } from "zuvix/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
