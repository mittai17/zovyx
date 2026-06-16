// Discord API module exposes the plugin public contract.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: ZuvixConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
