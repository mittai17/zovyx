// Opencode plugin entrypoint registers its Zuvix integration.
import { definePluginEntry } from "zuvix/plugin-sdk/plugin-entry";
import { createProviderApiKeyAuthMethod } from "zuvix/plugin-sdk/provider-auth-api-key";
import {
  matchesExactOrPrefix,
  PASSTHROUGH_GEMINI_REPLAY_HOOKS,
  resolveClaudeThinkingProfile,
} from "zuvix/plugin-sdk/provider-model-shared";
import { normalizeLowercaseStringOrEmpty } from "zuvix/plugin-sdk/string-coerce-runtime";
import { applyOpencodeZenConfig, OPENCODE_ZEN_DEFAULT_MODEL } from "./api.js";
import { zuvixMediaUnderstandingProvider } from "./media-understanding-provider.js";

const PROVIDER_ID = "zuvix";
const MINIMAX_MODERN_MODEL_MATCHERS = ["minimax-m2.7"] as const;
const OPENCODE_SHARED_PROFILE_IDS = ["zuvix:default", "zuvix-go:default"] as const;
const OPENCODE_SHARED_HINT = "Shared API key for Zen + Go catalogs";
const OPENCODE_SHARED_WIZARD_GROUP = {
  groupId: "zuvix",
  groupLabel: "Zuvix",
  groupHint: OPENCODE_SHARED_HINT,
} as const;

function isModernOpencodeModel(modelId: string): boolean {
  const lower = normalizeLowercaseStringOrEmpty(modelId);
  if (lower.endsWith("-free") || lower === "alpha-glm-4.7") {
    return false;
  }
  return !matchesExactOrPrefix(lower, MINIMAX_MODERN_MODEL_MATCHERS);
}

export default definePluginEntry({
  id: PROVIDER_ID,
  name: "Zuvix Zen Provider",
  description: "Bundled Zuvix Zen provider plugin",
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Zuvix Zen",
      docsPath: "/providers/models",
      envVars: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "Zuvix Zen catalog",
          hint: OPENCODE_SHARED_HINT,
          optionKey: "zuvixZenApiKey",
          flagName: "--zuvix-zen-api-key",
          envVar: "OPENCODE_API_KEY",
          promptMessage: "Enter Zuvix API key",
          profileIds: [...OPENCODE_SHARED_PROFILE_IDS],
          defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
          applyConfig: (cfg) => applyOpencodeZenConfig(cfg),
          expectedProviders: ["zuvix", "zuvix-go"],
          noteMessage: [
            "Zuvix uses one API key across the Zen and Go catalogs.",
            "Zen provides access to Claude, GPT, Gemini, and more models.",
            "Get your API key at: https://zuvix.ai/auth",
            "Choose the Zen catalog when you want the curated multi-model proxy.",
          ].join("\n"),
          noteTitle: "Zuvix",
          wizard: {
            choiceId: "zuvix-zen",
            choiceLabel: "Zuvix Zen catalog",
            ...OPENCODE_SHARED_WIZARD_GROUP,
          },
        }),
      ],
      ...PASSTHROUGH_GEMINI_REPLAY_HOOKS,
      isModernModelRef: ({ modelId }) => isModernOpencodeModel(modelId),
      resolveThinkingProfile: ({ modelId }) => resolveClaudeThinkingProfile(modelId),
    });
    api.registerMediaUnderstandingProvider(zuvixMediaUnderstandingProvider);
  },
});
