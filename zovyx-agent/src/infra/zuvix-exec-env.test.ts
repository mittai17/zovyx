// Tests Zuvix execution environment construction.
import { describe, expect, it } from "vitest";
import {
  ensureZuvixExecMarkerOnProcess,
  markZuvixExecEnv,
  ZUVIX_CLI_ENV_VALUE,
  ZUVIX_CLI_ENV_VAR,
} from "./zuvix-exec-env.js";

describe("markZuvixExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", ZUVIX_CLI: "0" };
    const marked = markZuvixExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      ZUVIX_CLI: ZUVIX_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.ZUVIX_CLI).toBe("0");
  });
});

describe("ensureZuvixExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [ZUVIX_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureZuvixExecMarkerOnProcess(env)).toBe(env);
    expect(env[ZUVIX_CLI_ENV_VAR]).toBe(ZUVIX_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[ZUVIX_CLI_ENV_VAR];
    delete process.env[ZUVIX_CLI_ENV_VAR];

    try {
      expect(ensureZuvixExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[ZUVIX_CLI_ENV_VAR]).toBe(ZUVIX_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[ZUVIX_CLI_ENV_VAR];
      } else {
        process.env[ZUVIX_CLI_ENV_VAR] = previous;
      }
    }
  });
});
