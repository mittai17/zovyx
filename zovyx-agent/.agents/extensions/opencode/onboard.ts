// Opencode setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  withAgentModelAliases,
  type ZuvixConfig,
} from "zuvix/plugin-sdk/provider-onboard";

export const OPENCODE_ZEN_DEFAULT_MODEL_REF = "zuvix/claude-opus-4-6";

export function applyOpencodeZenProviderConfig(cfg: ZuvixConfig): ZuvixConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models: withAgentModelAliases(cfg.agents?.defaults?.models, [
          { modelRef: OPENCODE_ZEN_DEFAULT_MODEL_REF, alias: "Opus" },
        ]),
      },
    },
  };
}

export function applyOpencodeZenConfig(cfg: ZuvixConfig): ZuvixConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeZenProviderConfig(cfg),
    OPENCODE_ZEN_DEFAULT_MODEL_REF,
  );
}
