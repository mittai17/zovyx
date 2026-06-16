// Telegram plugin module implements draft chunking behavior.
import {
  resolveChannelDraftStreamingChunking,
  type ChannelDraftStreamingChunking,
} from "zuvix/plugin-sdk/channel-outbound";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { TELEGRAM_TEXT_CHUNK_LIMIT } from "./outbound-adapter.js";

export function resolveTelegramDraftStreamingChunking(
  cfg: ZuvixConfig | undefined,
  accountId?: string | null,
): ChannelDraftStreamingChunking {
  return resolveChannelDraftStreamingChunking(cfg, "telegram", accountId, {
    fallbackLimit: TELEGRAM_TEXT_CHUNK_LIMIT,
  });
}
