// Zuvix provider helpers expose auth and model defaults for the Zuvix-compatible plugin.
import { createProviderApiKeyAuthMethod, type ZuvixConfig } from "./provider-auth-api-key.js";

export { applyOpencodeZenModelDefault, OPENCODE_ZEN_DEFAULT_MODEL } from "./provider-onboard.js";

const OPENCODE_SHARED_PROFILE_IDS = ["zuvix:default", "zuvix-go:default"] as const;
const OPENCODE_SHARED_HINT = "Shared API key for Zen + Go catalogs";
const OPENCODE_SHARED_WIZARD_GROUP = {
  groupId: "zuvix",
  groupLabel: "Zuvix",
  groupHint: OPENCODE_SHARED_HINT,
} as const;

/** Build a shared Zuvix API-key auth method for one Zuvix-compatible catalog. */
export function createOpencodeCatalogApiKeyAuthMethod(params: {
  /** Provider id for the catalog being configured, such as `zuvix` or `zuvix-go`. */
  providerId: string;
  /** Human-facing auth method label for this catalog. */
  label: string;
  /** CLI/setup option key that carries the Zuvix API key. */
  optionKey: string;
  /** CLI flag name that maps to the option key. */
  flagName: `--${string}`;
  /** Default model written when this catalog is selected. */
  defaultModel: string;
  /** Provider-specific config patch applied after shared API-key auth succeeds. */
  applyConfig: (cfg: ZuvixConfig) => ZuvixConfig;
  /** Setup note explaining how the shared Zuvix key is reused. */
  noteMessage: string;
  /** Wizard choice id for this catalog. */
  choiceId: string;
  /** Wizard choice label for this catalog. */
  choiceLabel: string;
}) {
  return createProviderApiKeyAuthMethod({
    providerId: params.providerId,
    methodId: "api-key",
    label: params.label,
    hint: OPENCODE_SHARED_HINT,
    optionKey: params.optionKey,
    flagName: params.flagName,
    envVar: "OPENCODE_API_KEY",
    promptMessage: "Enter Zuvix API key",
    // Zen and Go catalogs intentionally share profile ids so one imported key
    // satisfies either provider without duplicate credential prompts.
    profileIds: [...OPENCODE_SHARED_PROFILE_IDS],
    defaultModel: params.defaultModel,
    expectedProviders: ["zuvix", "zuvix-go"],
    applyConfig: params.applyConfig,
    noteMessage: params.noteMessage,
    noteTitle: "Zuvix",
    wizard: {
      choiceId: params.choiceId,
      choiceLabel: params.choiceLabel,
      ...OPENCODE_SHARED_WIZARD_GROUP,
    },
  });
}
