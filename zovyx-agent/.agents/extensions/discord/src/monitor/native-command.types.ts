// Discord type declarations define plugin contracts.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import type { CommandArgValues } from "zuvix/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<ZuvixConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
