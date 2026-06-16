// Provider-index public facade for normalized provider discovery metadata.
export { loadZuvixProviderIndex } from "./load.js";
export { normalizeZuvixProviderIndex } from "./normalize.js";
export type {
  ZuvixProviderIndex,
  ZuvixProviderIndexPluginInstall,
  ZuvixProviderIndexPlugin,
  ZuvixProviderIndexProviderAuthChoice,
  ZuvixProviderIndexProvider,
} from "./types.js";
