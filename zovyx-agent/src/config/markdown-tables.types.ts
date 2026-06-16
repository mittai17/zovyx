// Defines markdown table config types used by rendering surfaces.
import type { MarkdownTableMode } from "./types.base.js";
import type { ZuvixConfig } from "./types.zuvix.js";

/** Parameters for resolving markdown table rendering per config and channel. */
export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<ZuvixConfig>;
  channel?: string | null;
  accountId?: string | null;
  supportsBlockTables?: boolean;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
