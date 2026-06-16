// Whatsapp plugin module implements account types behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<ZuvixConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
