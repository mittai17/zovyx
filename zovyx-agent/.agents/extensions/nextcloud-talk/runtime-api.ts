// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "zuvix/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "zuvix/plugin-sdk/channel-contract";
export { logInboundDrop } from "zuvix/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "zuvix/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  ZuvixConfig,
} from "zuvix/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "zuvix/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "zuvix/plugin-sdk/channel-outbound";
export type { OutboundReplyPayload } from "zuvix/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "zuvix/plugin-sdk/reply-payload";
export type { PluginRuntime } from "zuvix/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "zuvix/plugin-sdk/runtime";
export type { SecretInput } from "zuvix/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "zuvix/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
