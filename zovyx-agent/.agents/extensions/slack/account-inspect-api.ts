// Slack API module exposes the plugin public contract.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: ZuvixConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
