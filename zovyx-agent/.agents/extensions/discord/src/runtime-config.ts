// Discord helper module supports runtime config behavior.
import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "zuvix/plugin-sdk/runtime-config-snapshot";
import type { ZuvixConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: ZuvixConfig): ZuvixConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
