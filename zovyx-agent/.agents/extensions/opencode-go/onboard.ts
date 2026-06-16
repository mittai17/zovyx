// Opencode Go setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  type ZuvixConfig,
} from "zuvix/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "zuvix-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: ZuvixConfig): ZuvixConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: ZuvixConfig): ZuvixConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
