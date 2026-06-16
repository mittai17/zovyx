// Hook install record helpers read and write installed hook metadata.
import type { HookInstallRecord } from "../config/types.hooks.js";
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Install record plus the hook pack id being updated in config. */
export type HookInstallUpdate = HookInstallRecord & { hookId: string };

/** Return config with one hook install record merged into hooks.internal.installs. */
export function recordHookInstall(cfg: ZuvixConfig, update: HookInstallUpdate): ZuvixConfig {
  const { hookId, ...record } = update;
  const installs = {
    ...cfg.hooks?.internal?.installs,
    [hookId]: {
      ...cfg.hooks?.internal?.installs?.[hookId],
      ...record,
      installedAt: record.installedAt ?? new Date().toISOString(),
    },
  };

  return {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        ...cfg.hooks?.internal,
        installs: {
          ...installs,
          [hookId]: installs[hookId],
        },
      },
    },
  };
}
