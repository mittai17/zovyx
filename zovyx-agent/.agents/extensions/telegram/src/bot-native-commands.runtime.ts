// Telegram plugin module implements bot native commands behavior.
export {
  ensureConfiguredBindingRouteReady,
  recordInboundSessionMetaSafe,
} from "zuvix/plugin-sdk/conversation-runtime";
export { getAgentScopedMediaLocalRoots } from "zuvix/plugin-sdk/media-runtime";
export {
  executePluginCommand,
  getPluginCommandSpecs,
  matchPluginCommand,
} from "zuvix/plugin-sdk/plugin-runtime";
export {
  finalizeInboundContext,
  resolveChunkMode,
} from "zuvix/plugin-sdk/reply-dispatch-runtime";
export { resolveThreadSessionKeys } from "zuvix/plugin-sdk/routing";
export { getSessionEntry } from "zuvix/plugin-sdk/session-store-runtime";
