// Lobster API module exposes the plugin public contract.
export { definePluginEntry } from "zuvix/plugin-sdk/core";
export type {
  AnyAgentTool,
  ZuvixPluginApi,
  ZuvixPluginToolContext,
  ZuvixPluginToolFactory,
} from "zuvix/plugin-sdk/core";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "zuvix/plugin-sdk/windows-spawn";
