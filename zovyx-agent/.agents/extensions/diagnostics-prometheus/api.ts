// Diagnostics Prometheus API module exposes the plugin public contract.
export type {
  DiagnosticEventMetadata,
  DiagnosticEventPayload,
} from "zuvix/plugin-sdk/diagnostic-runtime";
export { isInternalDiagnosticEventMetadata } from "zuvix/plugin-sdk/diagnostic-runtime";
export {
  emptyPluginConfigSchema,
  type ZuvixPluginApi,
  type ZuvixPluginHttpRouteHandler,
  type ZuvixPluginService,
  type ZuvixPluginServiceContext,
} from "zuvix/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "zuvix/plugin-sdk/security-runtime";
