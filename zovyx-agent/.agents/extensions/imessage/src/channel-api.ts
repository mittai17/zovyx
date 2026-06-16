// Imessage API module exposes the plugin public contract.
import { formatTrimmedAllowFromEntries } from "zuvix/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "zuvix/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "zuvix/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "zuvix/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "zuvix/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "zuvix/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
