// Imessage plugin module implements account types behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<ZuvixConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
