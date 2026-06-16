// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "zuvix/plugin-sdk/plugin-entry";
export type { ZuvixPluginApi } from "zuvix/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "zuvix/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "zuvix/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "zuvix/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "zuvix/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "zuvix/plugin-sdk/tts-runtime";
export { sleep } from "zuvix/plugin-sdk/runtime-env";
