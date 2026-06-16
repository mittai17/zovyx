// Imessage helper module supports config accessors behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { resolveIMessageAccount } from "./accounts.js";

export function resolveIMessageConfigAllowFrom(params: {
  cfg: ZuvixConfig;
  accountId?: string | null;
}): string[] {
  return (resolveIMessageAccount(params).config.allowFrom ?? []).map((entry) => String(entry));
}

export function resolveIMessageConfigDefaultTo(params: {
  cfg: ZuvixConfig;
  accountId?: string | null;
}): string | undefined {
  const defaultTo = resolveIMessageAccount(params).config.defaultTo;
  if (defaultTo == null) {
    return undefined;
  }
  const normalized = defaultTo.trim();
  return normalized || undefined;
}
