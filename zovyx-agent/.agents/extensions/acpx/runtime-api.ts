/**
 * Public runtime API barrel for ACPX. Core and plugin consumers import these
 * SDK-facing ACP runtime contracts instead of reaching into ACPX internals.
 */
export type { AcpRuntimeErrorCode } from "zuvix/plugin-sdk/acp-runtime-backend";
export {
  AcpRuntimeError,
  getAcpRuntimeBackend,
  tryDispatchAcpReplyHook,
  registerAcpRuntimeBackend,
  unregisterAcpRuntimeBackend,
} from "zuvix/plugin-sdk/acp-runtime-backend";
export type {
  AcpRuntime,
  AcpRuntimeCapabilities,
  AcpRuntimeDoctorReport,
  AcpRuntimeEnsureInput,
  AcpRuntimeEvent,
  AcpRuntimeHandle,
  AcpRuntimeStatus,
  AcpRuntimeTurn,
  AcpRuntimeTurnAttachment,
  AcpRuntimeTurnInput,
  AcpRuntimeTurnResult,
  AcpRuntimeTurnResultError,
  AcpSessionUpdateTag,
} from "zuvix/plugin-sdk/acp-runtime-backend";
export type {
  ZuvixPluginApi,
  ZuvixPluginConfigSchema,
  ZuvixPluginService,
  ZuvixPluginServiceContext,
  PluginLogger,
} from "zuvix/plugin-sdk/core";
export type {
  PluginHookReplyDispatchContext,
  PluginHookReplyDispatchEvent,
  PluginHookReplyDispatchResult,
} from "zuvix/plugin-sdk/core";
export type {
  WindowsSpawnProgram,
  WindowsSpawnProgramCandidate,
  WindowsSpawnResolution,
} from "zuvix/plugin-sdk/windows-spawn";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "zuvix/plugin-sdk/windows-spawn";
export {
  listKnownProviderAuthEnvVarNames,
  omitEnvKeysCaseInsensitive,
} from "zuvix/plugin-sdk/provider-env-vars";
