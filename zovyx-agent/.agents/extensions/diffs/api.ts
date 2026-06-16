// Diffs API module exposes the plugin public contract.
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export {
  definePluginEntry,
  type AnyAgentTool,
  type ZuvixPluginApi,
  type ZuvixPluginConfigSchema,
  type ZuvixPluginToolContext,
  type PluginLogger,
} from "zuvix/plugin-sdk/plugin-entry";
export { resolvePreferredZuvixTmpDir } from "zuvix/plugin-sdk/temp-path";
