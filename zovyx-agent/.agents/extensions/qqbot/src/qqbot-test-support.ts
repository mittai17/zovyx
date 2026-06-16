// Qqbot plugin module implements qqbot test support behavior.
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): ZuvixConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as ZuvixConfig;
}

export function makeQqbotDefaultAccountConfig(): ZuvixConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as ZuvixConfig;
}
