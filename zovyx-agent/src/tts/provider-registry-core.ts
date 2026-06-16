// TTS provider registry core stores provider factories and defaults.
import type { ZuvixConfig } from "../config/types.js";
import {
  buildCapabilityProviderMaps,
  normalizeCapabilityProviderId,
} from "../plugins/provider-registry-shared.js";
import type { SpeechProviderPlugin } from "../plugins/types.js";
import type { SpeechProviderId } from "./provider-types.js";

/** Resolver contract used by default and loaded-only speech provider registries. */
export type SpeechProviderRegistryResolver = {
  getProvider: (providerId: string, cfg?: ZuvixConfig) => SpeechProviderPlugin | undefined;
  listProviders: (cfg?: ZuvixConfig) => SpeechProviderPlugin[];
};

/** Normalize user/provider IDs into the canonical speech provider ID shape. */
export function normalizeSpeechProviderId(
  providerId: string | undefined,
): SpeechProviderId | undefined {
  return normalizeCapabilityProviderId(providerId);
}

/** Create a registry facade with canonical listing, alias lookup, and ID canonicalization. */
export function createSpeechProviderRegistry(resolver: SpeechProviderRegistryResolver) {
  const buildResolvedProviderMaps = (cfg?: ZuvixConfig) =>
    buildCapabilityProviderMaps(resolver.listProviders(cfg));

  const listProviders = (cfg?: ZuvixConfig): SpeechProviderPlugin[] => [
    ...buildResolvedProviderMaps(cfg).canonical.values(),
  ];

  const getProvider = (
    providerId: string | undefined,
    cfg?: ZuvixConfig,
  ): SpeechProviderPlugin | undefined => {
    const normalized = normalizeSpeechProviderId(providerId);
    if (!normalized) {
      return undefined;
    }
    return (
      resolver.getProvider(normalized, cfg) ??
      buildResolvedProviderMaps(cfg).aliases.get(normalized)
    );
  };

  const canonicalizeProviderId = (
    providerId: string | undefined,
    cfg?: ZuvixConfig,
  ): SpeechProviderId | undefined => {
    const normalized = normalizeSpeechProviderId(providerId);
    if (!normalized) {
      return undefined;
    }
    return getProvider(normalized, cfg)?.id ?? normalized;
  };

  return {
    canonicalizeSpeechProviderId: canonicalizeProviderId,
    getSpeechProvider: getProvider,
    listSpeechProviders: listProviders,
  };
}
