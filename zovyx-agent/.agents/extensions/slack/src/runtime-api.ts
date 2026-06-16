// Slack API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromRequiredCredentialStatuses,
} from "zuvix/plugin-sdk/channel-status";
export { buildChannelConfigSchema, SlackConfigSchema } from "../config-api.js";
export type { ChannelMessageActionContext } from "zuvix/plugin-sdk/channel-contract";
export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/account-id";
export type {
  ChannelPlugin,
  ZuvixPluginApi,
  PluginRuntime,
} from "zuvix/plugin-sdk/channel-plugin-common";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export type { SlackAccountConfig } from "zuvix/plugin-sdk/config-contracts";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "zuvix/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export { looksLikeSlackTargetId, normalizeSlackMessagingTarget } from "./target-parsing.js";
export { getChatChannelMeta } from "./channel-api.js";
export {
  createActionGate,
  imageResultFromFile,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringParam,
  withNormalizedTimestamp,
} from "zuvix/plugin-sdk/channel-actions";
