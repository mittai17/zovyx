// Telegram plugin module implements threading tool context behavior.
import type {
  ChannelThreadingContext,
  ChannelThreadingToolContext,
} from "zuvix/plugin-sdk/channel-contract";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { normalizeOptionalString } from "zuvix/plugin-sdk/string-coerce-runtime";
import { parseTelegramTarget } from "./targets.js";

function resolveTelegramToolContextThreadId(context: ChannelThreadingContext): string | undefined {
  if (context.MessageThreadId != null) {
    return String(context.MessageThreadId);
  }
  const currentChannelId = normalizeOptionalString(context.To);
  if (!currentChannelId) {
    return undefined;
  }
  const parsedTarget = parseTelegramTarget(currentChannelId);
  return parsedTarget.messageThreadId != null ? String(parsedTarget.messageThreadId) : undefined;
}

export function buildTelegramThreadingToolContext(params: {
  cfg: ZuvixConfig;
  accountId?: string | null;
  context: ChannelThreadingContext;
  hasRepliedRef?: { value: boolean };
}): ChannelThreadingToolContext {
  void params.cfg;
  void params.accountId;

  return {
    currentChannelId: normalizeOptionalString(params.context.To),
    currentThreadTs: resolveTelegramToolContextThreadId(params.context),
    hasRepliedRef: params.hasRepliedRef,
  };
}
