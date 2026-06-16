// Legacy config migration bridge for channel doctor compatibility contracts.
import { getBootstrapChannelPlugin } from "../../../channels/plugins/bootstrap-registry.js";
import { loadBundledChannelDoctorContractApi } from "../../../channels/plugins/doctor-contract-api.js";
import type { ZuvixConfig } from "../../../config/types.js";
import {
  applyPluginDoctorCompatibilityMigrations,
  collectRelevantDoctorPluginIds,
} from "../../../plugins/doctor-contract-registry.js";
import { isRecord } from "./legacy-config-record-shared.js";

type ChannelDoctorCompatibilityMutation = {
  config: ZuvixConfig;
  changes: string[];
};

type ChannelDoctorCompatibilityNormalizer = (params: {
  cfg: ZuvixConfig;
}) => ChannelDoctorCompatibilityMutation;

function collectRelevantDoctorChannelIds(raw: unknown): string[] {
  const channels = isRecord(raw) && isRecord(raw.channels) ? raw.channels : null;
  if (!channels) {
    return [];
  }
  return Object.keys(channels)
    .filter((channelId) => channelId !== "defaults")
    .toSorted();
}

function resolveBundledChannelCompatibilityNormalizer(
  channelId: string,
): ChannelDoctorCompatibilityNormalizer | undefined {
  const contractNormalizer =
    loadBundledChannelDoctorContractApi(channelId)?.normalizeCompatibilityConfig;
  if (typeof contractNormalizer === "function") {
    return contractNormalizer;
  }
  return getBootstrapChannelPlugin(channelId)?.doctor?.normalizeCompatibilityConfig;
}

function collectPluginDoctorCompatibilityIds(params: {
  raw: unknown;
  unresolvedChannelIds: readonly string[];
}): string[] {
  const unresolvedChannelIds = new Set(params.unresolvedChannelIds);
  return [
    ...new Set([
      ...params.unresolvedChannelIds,
      ...collectRelevantDoctorPluginIds(params.raw).filter(
        (pluginId) => !unresolvedChannelIds.has(pluginId),
      ),
    ]),
  ].toSorted();
}

/** Apply bundled and plugin channel compatibility migrations to a legacy config object. */
export function applyChannelDoctorCompatibilityMigrations(cfg: Record<string, unknown>): {
  next: Record<string, unknown>;
  changes: string[];
} {
  let nextCfg = cfg as ZuvixConfig;
  const changes: string[] = [];
  const unresolvedChannelIds: string[] = [];

  for (const channelId of collectRelevantDoctorChannelIds(cfg)) {
    const normalizeCompatibilityConfig = resolveBundledChannelCompatibilityNormalizer(channelId);
    if (!normalizeCompatibilityConfig) {
      unresolvedChannelIds.push(channelId);
      continue;
    }
    const mutation = normalizeCompatibilityConfig({ cfg: nextCfg });
    if (!mutation || mutation.changes.length === 0) {
      continue;
    }
    nextCfg = mutation.config;
    changes.push(...mutation.changes);
  }

  const pluginIds = collectPluginDoctorCompatibilityIds({ raw: cfg, unresolvedChannelIds });
  if (pluginIds.length > 0) {
    const compat = applyPluginDoctorCompatibilityMigrations(nextCfg, {
      config: cfg as ZuvixConfig,
      pluginIds,
    });
    nextCfg = compat.config;
    changes.push(...compat.changes);
  }

  return {
    next: nextCfg as ZuvixConfig & Record<string, unknown>,
    changes,
  };
}
