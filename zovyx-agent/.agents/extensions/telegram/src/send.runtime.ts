// Telegram plugin module implements send behavior.
export { requireRuntimeConfig } from "zuvix/plugin-sdk/plugin-config-runtime";
export { resolveMarkdownTableMode } from "zuvix/plugin-sdk/markdown-table-runtime";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
export type { PollInput, MediaKind } from "zuvix/plugin-sdk/media-runtime";
export {
  buildOutboundMediaLoadOptions,
  getImageMetadata,
  isGifMedia,
  kindFromMime,
  normalizePollInput,
  probeVideoDimensions,
} from "zuvix/plugin-sdk/media-runtime";
export { loadWebMedia } from "zuvix/plugin-sdk/web-media";
