// Nostr API module exposes the plugin public contract.
export {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  type ChannelPlugin,
} from "zuvix/plugin-sdk/channel-plugin-common";
export type { ChannelOutboundAdapter } from "zuvix/plugin-sdk/channel-contract";
export {
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
} from "zuvix/plugin-sdk/status-helpers";
