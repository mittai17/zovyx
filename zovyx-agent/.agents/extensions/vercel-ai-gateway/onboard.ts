// Vercel Ai Gateway setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  type ZuvixConfig,
} from "zuvix/plugin-sdk/provider-onboard";

export const VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF = "vercel-ai-gateway/anthropic/claude-opus-4.6";

function applyVercelAiGatewayProviderConfig(cfg: ZuvixConfig): ZuvixConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF] = {
    ...models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF],
    alias: models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF]?.alias ?? "Vercel AI Gateway",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyVercelAiGatewayConfig(cfg: ZuvixConfig): ZuvixConfig {
  return applyAgentDefaultModelPrimary(
    applyVercelAiGatewayProviderConfig(cfg),
    VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
  );
}
