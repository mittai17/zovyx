/**
 * Model fallback config fixture.
 *
 * Builds a minimal config with primary and fallback models for model-selection tests.
 */
import type { ZuvixConfig } from "../../config/types.zuvix.js";

export function makeModelFallbackCfg(overrides: Partial<ZuvixConfig> = {}): ZuvixConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as ZuvixConfig;
}
