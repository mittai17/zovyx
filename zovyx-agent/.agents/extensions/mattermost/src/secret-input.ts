// Mattermost plugin module implements secret input behavior.
export type { SecretInput } from "zuvix/plugin-sdk/secret-input";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "zuvix/plugin-sdk/secret-input";
