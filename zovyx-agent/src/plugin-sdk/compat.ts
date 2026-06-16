/**
 * @deprecated Legacy compat surface for external plugins that still depend on
 * older broad plugin-sdk imports. Use focused zuvix/plugin-sdk subpaths
 * instead.
 */

import {
  createChannelReplyPipeline as createChannelReplyPipelineCompat,
  createReplyPrefixContext as createReplyPrefixContextCompat,
  createReplyPrefixOptions as createReplyPrefixOptionsCompat,
  createTypingCallbacks as createTypingCallbacksCompat,
  resolveChannelSourceReplyDeliveryMode as resolveChannelSourceReplyDeliveryModeCompat,
  type ChannelReplyPipeline as ChannelReplyPipelineCompat,
  type CreateTypingCallbacksParams as CreateTypingCallbacksParamsCompat,
  type ReplyPrefixContext as ReplyPrefixContextCompat,
  type ReplyPrefixContextBundle as ReplyPrefixContextBundleCompat,
  type ReplyPrefixOptions as ReplyPrefixOptionsCompat,
  type SourceReplyDeliveryMode as SourceReplyDeliveryModeCompat,
  type TypingCallbacks as TypingCallbacksCompat,
} from "./channel-reply-core.js";

const shouldWarnCompatImport =
  process.env.VITEST !== "true" &&
  process.env.NODE_ENV !== "test" &&
  process.env.ZUVIX_SUPPRESS_PLUGIN_SDK_COMPAT_WARNING !== "1";

if (shouldWarnCompatImport) {
  process.emitWarning(
    "zuvix/plugin-sdk/compat is deprecated for new plugins. Migrate to focused zuvix/plugin-sdk/<subpath> imports. See https://docs.zuvix.ai/plugins/sdk-migration",
    {
      code: "ZUVIX_PLUGIN_SDK_COMPAT_DEPRECATED",
      detail:
        "Bundled plugins must use scoped plugin-sdk subpaths. External plugins may keep compat temporarily while migrating. Migration guide: https://docs.zuvix.ai/plugins/sdk-migration",
    },
  );
}

export { emptyPluginConfigSchema } from "../plugins/config-schema.js";
export type {
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
} from "../plugins/memory-state.js";
export { resolveControlCommandGate } from "../channels/command-gating.js";
export {
  buildMemorySystemPromptAddition,
  delegateCompactionToRuntime,
} from "../context-engine/delegate.js";
export { registerContextEngine } from "../context-engine/registry.js";
export type { DiagnosticEventPayload } from "../infra/diagnostic-events.js";
export { onDiagnosticEvent } from "../infra/diagnostic-events.js";
export { optionalStringEnum, stringEnum } from "../agents/schema/typebox.js";
export {
  applyAuthProfileConfig,
  buildApiKeyCredential,
  upsertApiKeyProfile,
  writeOAuthCredentials,
  type ApiKeyStorageOptions,
  type WriteOAuthCredentialsOptions,
} from "../plugins/provider-auth-helpers.js";

export { createAccountStatusSink } from "./channel-lifecycle.core.js";
export { createPluginRuntimeStore } from "./runtime-store.js";
export { KeyedAsyncQueue } from "./keyed-async-queue.js";
export { normalizeAccountId } from "./account-id.js";
export { resolvePreferredZuvixTmpDir } from "./temp-path.js";

export {
  createHybridChannelConfigAdapter,
  createHybridChannelConfigBase,
  createScopedAccountConfigAccessors,
  createScopedChannelConfigAdapter,
  createScopedChannelConfigBase,
  createScopedDmSecurityResolver,
  createTopLevelChannelConfigAdapter,
  createTopLevelChannelConfigBase,
  mapAllowFromEntries,
} from "./channel-config-helpers.js";
export { formatAllowFromLowercase, formatNormalizedAllowFromEntries } from "./allow-from.js";
export * from "./channel-config-schema.js";
export * from "./channel-policy.js";
export { collectOpenGroupPolicyConfiguredRouteWarnings } from "./channel-policy.js";
export * from "./reply-history.js";
export * from "./directory-runtime.js";
export { mapAllowlistResolutionInputs } from "./allow-from.js";

/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export const createChannelReplyPipeline = createChannelReplyPipelineCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export const createReplyPrefixContext = createReplyPrefixContextCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export const createReplyPrefixOptions = createReplyPrefixOptionsCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export const createTypingCallbacks = createTypingCallbacksCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export const resolveChannelSourceReplyDeliveryMode = resolveChannelSourceReplyDeliveryModeCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type ChannelReplyPipeline = ChannelReplyPipelineCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type CreateTypingCallbacksParams = CreateTypingCallbacksParamsCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type ReplyPrefixContext = ReplyPrefixContextCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type ReplyPrefixContextBundle = ReplyPrefixContextBundleCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type ReplyPrefixOptions = ReplyPrefixOptionsCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type SourceReplyDeliveryMode = SourceReplyDeliveryModeCompat;
/** @deprecated Use `zuvix/plugin-sdk/channel-outbound`. */
export type TypingCallbacks = TypingCallbacksCompat;
