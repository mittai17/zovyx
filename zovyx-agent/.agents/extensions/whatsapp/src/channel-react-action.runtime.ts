// Whatsapp plugin module implements channel react action behavior.
import { readStringOrNumberParam, readStringParam } from "zuvix/plugin-sdk/channel-actions";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export { resolveReactionMessageId } from "zuvix/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { resolveAuthorizedWhatsAppOutboundTarget } from "./action-runtime-target-auth.js";
export { resolveWhatsAppAccount, resolveWhatsAppMediaMaxBytes } from "./accounts.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { sendMessageWhatsApp } from "./send.js";
export { readStringOrNumberParam, readStringParam, type ZuvixConfig };
