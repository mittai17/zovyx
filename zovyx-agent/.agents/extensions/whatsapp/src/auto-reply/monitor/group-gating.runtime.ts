// Whatsapp plugin module implements group gating behavior.
export {
  implicitMentionKindWhen,
  resolveInboundMentionDecision,
} from "zuvix/plugin-sdk/channel-mention-gating";
export { hasControlCommand } from "zuvix/plugin-sdk/command-detection";
export { createChannelHistoryWindow } from "zuvix/plugin-sdk/reply-history";
export { parseActivationCommand } from "zuvix/plugin-sdk/group-activation";
export { normalizeE164 } from "../../text-runtime.js";
