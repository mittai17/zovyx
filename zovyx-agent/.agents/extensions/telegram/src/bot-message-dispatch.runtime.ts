// Telegram plugin module implements bot message dispatch behavior.
export {
  loadSessionStore,
  readLatestAssistantTextFromSessionTranscript,
  resolveAndPersistSessionFile,
  resolveSessionStoreEntry,
  updateSessionStoreEntry,
} from "zuvix/plugin-sdk/session-store-runtime";
export { resolveMarkdownTableMode } from "zuvix/plugin-sdk/markdown-table-runtime";
export { getAgentScopedMediaLocalRoots } from "zuvix/plugin-sdk/media-runtime";
export { resolveChunkMode } from "zuvix/plugin-sdk/reply-dispatch-runtime";
export {
  generateTelegramTopicLabel as generateTopicLabel,
  resolveAutoTopicLabelConfig,
} from "./auto-topic-label.js";
