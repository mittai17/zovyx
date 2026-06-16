// Zalo plugin module implements runtime support behavior.
export type { ReplyPayload } from "zuvix/plugin-sdk/reply-runtime";
export type { ZuvixConfig, GroupPolicy } from "zuvix/plugin-sdk/config-contracts";
export type { MarkdownTableMode } from "zuvix/plugin-sdk/config-contracts";
export type { BaseTokenResolution } from "zuvix/plugin-sdk/channel-contract";
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "zuvix/plugin-sdk/channel-contract";
export type { SecretInput } from "zuvix/plugin-sdk/secret-input";
export type { ChannelPlugin, PluginRuntime, WizardPrompter } from "zuvix/plugin-sdk/core";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export type { OutboundReplyPayload } from "zuvix/plugin-sdk/reply-payload";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  formatPairingApproveHint,
  jsonResult,
  normalizeAccountId,
  readStringParam,
  resolveClientIp,
} from "zuvix/plugin-sdk/core";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  buildSingleChannelSecretPromptState,
  mergeAllowFromEntries,
  migrateBaseNameToDefaultAccount,
  promptSingleChannelSecretInput,
  runSingleChannelSecretStep,
  setTopLevelChannelDmPolicyWithAllowFrom,
} from "zuvix/plugin-sdk/setup";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "zuvix/plugin-sdk/secret-input";
export {
  buildTokenChannelStatusSummary,
  PAIRING_APPROVED_MESSAGE,
} from "zuvix/plugin-sdk/channel-status";
export { buildBaseAccountStatusSnapshot } from "zuvix/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
export {
  formatAllowFromLowercase,
  isNormalizedSenderAllowed,
} from "zuvix/plugin-sdk/allow-from";
export { addWildcardAllowFrom } from "zuvix/plugin-sdk/setup";
export { resolveOpenProviderRuntimeGroupPolicy } from "zuvix/plugin-sdk/runtime-group-policy";
export {
  warnMissingProviderGroupPolicyFallbackOnce,
  resolveDefaultGroupPolicy,
} from "zuvix/plugin-sdk/runtime-group-policy";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export { logTypingFailure } from "zuvix/plugin-sdk/channel-feedback";
export {
  deliverTextOrMediaReply,
  isNumericTargetId,
  sendPayloadWithChunkedTextAndMedia,
} from "zuvix/plugin-sdk/reply-payload";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "zuvix/plugin-sdk/inbound-envelope";
export { waitForAbortSignal } from "zuvix/plugin-sdk/runtime";
export {
  applyBasicWebhookRequestGuards,
  createFixedWindowRateLimiter,
  createWebhookAnomalyTracker,
  readJsonWebhookBodyOrReject,
  registerPluginHttpRoute,
  registerWebhookTarget,
  registerWebhookTargetWithPluginRoute,
  resolveWebhookPath,
  resolveWebhookTargetWithAuthOrRejectSync,
  WEBHOOK_ANOMALY_COUNTER_DEFAULTS,
  WEBHOOK_RATE_LIMIT_DEFAULTS,
  withResolvedWebhookRequestPipeline,
} from "zuvix/plugin-sdk/webhook-ingress";
export type {
  RegisterWebhookPluginRouteOptions,
  RegisterWebhookTargetOptions,
} from "zuvix/plugin-sdk/webhook-ingress";
