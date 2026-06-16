// Toggles plugin enablement config for channels and agents.
import { normalizeChatChannelId } from "../channels/ids.js";
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Returns config with a plugin enabled/disabled and optional built-in channel state synced. */
export function setPluginEnabledInConfig(
  config: ZuvixConfig,
  pluginId: string,
  enabled: boolean,
  options: { updateChannelConfig?: boolean } = {},
): ZuvixConfig {
  const builtInChannelId = normalizeChatChannelId(pluginId);
  const resolvedId = builtInChannelId ?? pluginId;

  const next: ZuvixConfig = {
    ...config,
    plugins: {
      ...config.plugins,
      entries: {
        ...config.plugins?.entries,
        [resolvedId]: {
          ...(config.plugins?.entries?.[resolvedId] as object | undefined),
          enabled,
        },
      },
    },
  };

  if (!builtInChannelId || options.updateChannelConfig === false) {
    return next;
  }

  const channels = config.channels as Record<string, unknown> | undefined;
  const existing = channels?.[builtInChannelId];
  const existingRecord =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};

  return {
    ...next,
    channels: {
      ...config.channels,
      [builtInChannelId]: {
        ...existingRecord,
        enabled,
      },
    },
  };
}
