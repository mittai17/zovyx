/** Process env key that marks child commands as launched by the Zuvix CLI. */
export const ZUVIX_CLI_ENV_VAR = "ZUVIX_CLI";

/** Stable marker value used for Zuvix-launched subprocess detection. */
export const ZUVIX_CLI_ENV_VALUE = "1";

/** Returns a cloned env object with the Zuvix CLI marker set. */
export function markZuvixExecEnv<T extends Record<string, string | undefined>>(
  /** Source environment to clone before adding the subprocess marker. */
  env: T,
): T {
  return {
    ...env,
    [ZUVIX_CLI_ENV_VAR]: ZUVIX_CLI_ENV_VALUE,
  };
}

/** Mutates an existing process env object so current-process children inherit the marker. */
export function ensureZuvixExecMarkerOnProcess(
  /** Process env object to mutate; defaults to the current process environment. */
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[ZUVIX_CLI_ENV_VAR] = ZUVIX_CLI_ENV_VALUE;
  return env;
}
