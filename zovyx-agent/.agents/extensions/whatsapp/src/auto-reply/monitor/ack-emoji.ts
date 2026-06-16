// Whatsapp plugin module implements ack emoji behavior.
import { resolveAgentIdentity } from "zuvix/plugin-sdk/agent-runtime";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

const DEFAULT_WHATSAPP_ACK_REACTION = "👀";

type WhatsAppAckReactionConfig = NonNullable<
  NonNullable<NonNullable<ZuvixConfig["channels"]>["whatsapp"]>["ackReaction"]
>;

export function resolveWhatsAppAckEmoji(params: {
  cfg: ZuvixConfig;
  agentId: string;
  ackConfig: WhatsAppAckReactionConfig | undefined;
}): string {
  if (!params.ackConfig) {
    return "";
  }
  if (params.ackConfig.emoji !== undefined) {
    return params.ackConfig.emoji.trim();
  }
  return resolveAgentIdentityEmoji(params.cfg, params.agentId) ?? DEFAULT_WHATSAPP_ACK_REACTION;
}

function resolveAgentIdentityEmoji(cfg: ZuvixConfig, agentId: string): string | undefined {
  const emoji = resolveAgentIdentity(cfg, agentId)?.emoji?.trim();
  return emoji || undefined;
}
