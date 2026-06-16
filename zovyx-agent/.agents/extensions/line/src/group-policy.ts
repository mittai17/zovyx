// Line plugin module implements group policy behavior.
import { resolveChannelGroupRequireMention } from "zuvix/plugin-sdk/channel-policy";
import { resolveExactLineGroupConfigKey, type ZuvixConfig } from "./channel-api.js";

type LineGroupContext = {
  cfg: ZuvixConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveLineGroupRequireMention(params: LineGroupContext): boolean {
  const exactGroupId = resolveExactLineGroupConfigKey({
    cfg: params.cfg,
    accountId: params.accountId,
    groupId: params.groupId,
  });
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "line",
    groupId: exactGroupId ?? params.groupId,
    accountId: params.accountId,
  });
}
