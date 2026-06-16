// Discord API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  buildTokenChannelStatusSummary,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromCredentialStatuses,
} from "zuvix/plugin-sdk/channel-status";
export { buildChannelConfigSchema, DiscordConfigSchema } from "../config-api.js";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
} from "zuvix/plugin-sdk/channel-contract";
export type {
  ChannelPlugin,
  ZuvixPluginApi,
  PluginRuntime,
} from "zuvix/plugin-sdk/channel-plugin-common";
export type {
  DiscordAccountConfig,
  DiscordActionConfig,
  DiscordConfig,
  ZuvixConfig,
} from "zuvix/plugin-sdk/config-contracts";
export {
  jsonResult,
  readNonNegativeIntegerParam,
  readNumberParam,
  readPositiveIntegerParam,
  readStringArrayParam,
  readStringParam,
  resolvePollMaxSelections,
} from "zuvix/plugin-sdk/channel-actions";
export type { ActionGate } from "zuvix/plugin-sdk/channel-actions";
export { readBooleanParam } from "zuvix/plugin-sdk/boolean-param";
export {
  assertMediaNotDataUrl,
  parseAvailableTags,
  readReactionParams,
  withNormalizedTimestamp,
} from "zuvix/plugin-sdk/channel-actions";
export {
  createHybridChannelConfigAdapter,
  createScopedChannelConfigAdapter,
  createScopedAccountConfigAccessors,
  createScopedChannelConfigBase,
  createTopLevelChannelConfigAdapter,
} from "zuvix/plugin-sdk/channel-config-helpers";
export {
  createAccountActionGate,
  createAccountListHelpers,
} from "zuvix/plugin-sdk/account-helpers";
export { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "zuvix/plugin-sdk/account-id";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "zuvix/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export { resolveAccountEntry } from "zuvix/plugin-sdk/routing";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "zuvix/plugin-sdk/secret-input";
export { getChatChannelMeta } from "./channel-api.js";
export { resolveDiscordOutboundSessionRoute } from "./outbound-session-route.js";
