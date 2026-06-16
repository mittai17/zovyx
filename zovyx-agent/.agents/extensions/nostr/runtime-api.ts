// Private runtime barrel for the bundled Nostr extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export { getPluginRuntimeGatewayRequestScope } from "zuvix/plugin-sdk/plugin-runtime";
export type { PluginRuntime } from "zuvix/plugin-sdk/runtime-store";
