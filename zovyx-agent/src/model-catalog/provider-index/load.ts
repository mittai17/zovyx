// Provider-index loader normalizes bundled installable-provider metadata and falls back to an empty index.
import { normalizeZuvixProviderIndex } from "./normalize.js";
import { ZUVIX_PROVIDER_INDEX } from "./zuvix-provider-index.js";
import type { ZuvixProviderIndex } from "./types.js";

// Load the bundled provider index through the normalizer. Invalid generated or
// caller-supplied data falls back to an empty v1 index instead of leaking shape.
export function loadZuvixProviderIndex(
  source: unknown = ZUVIX_PROVIDER_INDEX,
): ZuvixProviderIndex {
  return normalizeZuvixProviderIndex(source) ?? { version: 1, providers: {} };
}
