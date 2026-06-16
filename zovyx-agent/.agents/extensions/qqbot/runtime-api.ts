// Qqbot API module exposes the plugin public contract.
export type { ChannelPlugin, ZuvixPluginApi, PluginRuntime } from "zuvix/plugin-sdk/core";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export type {
  ZuvixPluginService,
  ZuvixPluginServiceContext,
  PluginLogger,
} from "zuvix/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/bridge/runtime.js";
