// Test provider implementation for chat-style runtime interactions.
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Test-only speech provider identity used by talk config assertions. */
export const TALK_TEST_PROVIDER_ID = "acme-speech";
export const TALK_TEST_PROVIDER_LABEL = "Acme Speech";
export const TALK_TEST_PROVIDER_API_KEY_PATH = `talk.providers.${TALK_TEST_PROVIDER_ID}.apiKey`;
export const TALK_TEST_PROVIDER_API_KEY_PATH_SEGMENTS = [
  "talk",
  "providers",
  TALK_TEST_PROVIDER_ID,
  "apiKey",
] as const;

export function buildTalkTestProviderConfig(apiKey: unknown): ZuvixConfig {
  return {
    talk: {
      providers: {
        [TALK_TEST_PROVIDER_ID]: {
          apiKey,
        },
      },
    },
  } as ZuvixConfig;
}

export function readTalkTestProviderApiKey(config: ZuvixConfig): unknown {
  return config.talk?.providers?.[TALK_TEST_PROVIDER_ID]?.apiKey;
}
