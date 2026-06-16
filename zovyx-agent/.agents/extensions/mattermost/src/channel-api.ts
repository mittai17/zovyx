// Mattermost API module exposes the plugin public contract.
export { createAccountStatusSink } from "zuvix/plugin-sdk/channel-outbound";
export type { ChannelPlugin } from "zuvix/plugin-sdk/core";
export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/core";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
