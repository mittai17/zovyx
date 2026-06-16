// Lists expected shell environment keys for config validation.
import { uniqueStrings } from "@zuvix/normalization-core/string-normalization";
import { listKnownChannelEnvVarNames } from "../secrets/channel-env-vars.js";
import { listKnownProviderAuthEnvVarNames } from "../secrets/provider-env-vars.js";

const CORE_SHELL_ENV_EXPECTED_KEYS = ["ZUVIX_GATEWAY_TOKEN", "ZUVIX_GATEWAY_PASSWORD"];

/**
 * Lists env vars worth importing from login-shell fallback for this config load.
 *
 * Provider/channel helpers inspect the current environment so optional plugin
 * and auth aliases only trigger shell probing when their configured keys matter.
 */
export function resolveShellEnvExpectedKeys(env: NodeJS.ProcessEnv): string[] {
  return uniqueStrings([
    ...listKnownProviderAuthEnvVarNames({ env }),
    ...listKnownChannelEnvVarNames({ env }),
    ...CORE_SHELL_ENV_EXPECTED_KEYS,
  ]);
}
