// Googlechat plugin module implements group policy behavior.
import { resolveChannelGroupRequireMention } from "zuvix/plugin-sdk/channel-policy";
import type { ZuvixConfig } from "zuvix/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: ZuvixConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
