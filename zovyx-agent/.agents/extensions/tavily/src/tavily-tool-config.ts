// Tavily helper module supports tavily tool config behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import type { ZuvixPluginToolContext } from "zuvix/plugin-sdk/plugin-entry";
import type { ZuvixPluginApi } from "zuvix/plugin-sdk/plugin-runtime";

export type TavilyToolConfigContext = Pick<
  ZuvixPluginToolContext,
  "config" | "runtimeConfig" | "getRuntimeConfig"
>;

export function resolveTavilyToolConfig(
  api: ZuvixPluginApi,
  ctx?: TavilyToolConfigContext,
): ZuvixConfig {
  return ctx?.getRuntimeConfig?.() ?? ctx?.runtimeConfig ?? ctx?.config ?? api.config;
}
