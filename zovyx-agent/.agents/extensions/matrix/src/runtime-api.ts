// Matrix API module exposes the plugin public contract.
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "zuvix/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
  ToolAuthorizationError,
} from "zuvix/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "zuvix/plugin-sdk/channel-config-primitives";
export type { ChannelPlugin } from "zuvix/plugin-sdk/channel-core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "zuvix/plugin-sdk/channel-contract";
export {
  formatLocationText,
  toLocationContext,
  type NormalizedLocation,
} from "zuvix/plugin-sdk/channel-inbound";
export { logInboundDrop } from "zuvix/plugin-sdk/channel-inbound";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-outbound";
export { resolveAckReaction } from "zuvix/plugin-sdk/channel-feedback";
export type { ChannelSetupInput } from "zuvix/plugin-sdk/setup";
export type {
  ZuvixConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "zuvix/plugin-sdk/config-contracts";
export type { GroupToolPolicyConfig } from "zuvix/plugin-sdk/config-contracts";
export type { WizardPrompter } from "zuvix/plugin-sdk/setup";
export type { SecretInput } from "zuvix/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "zuvix/plugin-sdk/runtime-group-policy";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
  splitSetupEntries,
} from "zuvix/plugin-sdk/setup";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  ssrfPolicyFromAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "zuvix/plugin-sdk/ssrf-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "zuvix/plugin-sdk/channel-inbound";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "zuvix/plugin-sdk/acp-binding-runtime";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "zuvix/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "zuvix/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "zuvix/plugin-sdk/channel-outbound";
export { resolveAgentIdFromSessionKey } from "zuvix/plugin-sdk/routing";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export { normalizePollInput, type PollInput } from "zuvix/plugin-sdk/poll-runtime";
export { writeJsonFileAtomically } from "zuvix/plugin-sdk/json-store";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "zuvix/plugin-sdk/channel-targets";
export { buildTimeoutAbortSignal } from "./matrix/sdk/timeout-abort-signal.js";
export { formatZonedTimestamp } from "zuvix/plugin-sdk/time-runtime";
export type { PluginRuntime, RuntimeLogger } from "zuvix/plugin-sdk/plugin-runtime";
export type { ReplyPayload } from "zuvix/plugin-sdk/reply-runtime";
// resolveMatrixAccountStringValues already comes from the Matrix API barrel.
// Re-exporting auth-precedence here makes TS source loaders define the export twice.
