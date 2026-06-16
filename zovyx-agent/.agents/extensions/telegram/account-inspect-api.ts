// Telegram API module exposes the plugin public contract.
import type { ZuvixConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: ZuvixConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
