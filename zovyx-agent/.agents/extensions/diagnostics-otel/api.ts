// Diagnostics Otel API module exposes the plugin public contract.
export {
  createChildDiagnosticTraceContext,
  createDiagnosticTraceContext,
  emitDiagnosticEvent,
  formatDiagnosticTraceparent,
  isValidDiagnosticSpanId,
  isValidDiagnosticTraceFlags,
  isValidDiagnosticTraceId,
  onDiagnosticEvent,
  parseDiagnosticTraceparent,
  type DiagnosticEventMetadata,
  type DiagnosticEventPayload,
  type DiagnosticTraceContext,
} from "zuvix/plugin-sdk/diagnostic-runtime";
export { emptyPluginConfigSchema, type ZuvixPluginApi } from "zuvix/plugin-sdk/plugin-entry";
export type {
  ZuvixPluginService,
  ZuvixPluginServiceContext,
} from "zuvix/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "zuvix/plugin-sdk/security-runtime";
