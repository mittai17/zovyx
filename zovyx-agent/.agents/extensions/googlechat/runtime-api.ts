// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "zuvix/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "zuvix/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "zuvix/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "zuvix/plugin-sdk/channel-contract";
export { missingTargetError } from "zuvix/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "zuvix/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export { PAIRING_APPROVED_MESSAGE } from "zuvix/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "zuvix/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "zuvix/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "zuvix/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "zuvix/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "zuvix/plugin-sdk/outbound-media";
export type { PluginRuntime } from "zuvix/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "zuvix/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "zuvix/plugin-sdk/config-contracts";
export { extractToolSend } from "zuvix/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "zuvix/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "zuvix/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "zuvix/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "zuvix/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "zuvix/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
