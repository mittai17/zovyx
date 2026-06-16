// Packed Plugin Sdk Type Smoke script supports Zuvix repository automation.
type PublicPluginSdkModules = [
  typeof import("zuvix/plugin-sdk"),
  typeof import("zuvix/plugin-sdk/channel-entry-contract"),
  typeof import("zuvix/plugin-sdk/config-contracts"),
  typeof import("zuvix/plugin-sdk/provider-entry"),
  typeof import("zuvix/plugin-sdk/runtime-env"),
];

const resolvedModules = null as unknown as PublicPluginSdkModules;

void resolvedModules;
