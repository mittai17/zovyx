// Signal plugin module implements account types behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<ZuvixConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
