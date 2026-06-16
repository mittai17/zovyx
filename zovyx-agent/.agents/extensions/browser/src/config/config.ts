/**
 * Browser plugin config contract re-exports from the SDK config bridge.
 */
export {
  getRuntimeConfig,
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  mutateConfigFile,
  replaceConfigFile,
  type BrowserConfig,
  type BrowserProfileConfig,
  type ZuvixConfig,
} from "../sdk-config.js";
