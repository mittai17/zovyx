// Upgrade Survivor Config Recipe tests cover upgrade survivor config recipe script behavior.
import { describe, expect, it } from "vitest";
import {
  CONFIG_COMMAND_MAX_BUFFER_BYTES,
  CONFIG_COMMAND_TIMEOUT_MS,
  resolveUpgradeSurvivorZuvixCommand,
  runUpgradeSurvivorZuvixStep,
} from "../../scripts/e2e/lib/upgrade-survivor/config-recipe.mjs";

describe("upgrade survivor config recipe command resolution", () => {
  it("wraps Windows zuvix npm shims through cmd.exe", () => {
    expect(
      resolveUpgradeSurvivorZuvixCommand(
        ["config", "set", "models.providers.openai", '{"apiKey":"sk test"}', "--strict-json"],
        {
          comSpec: String.raw`C:\Windows\System32\cmd.exe`,
          platform: "win32",
        },
      ),
    ).toEqual({
      args: [
        "/d",
        "/s",
        "/c",
        'zuvix.cmd config set models.providers.openai "{""apiKey"":""sk test""}" --strict-json',
      ],
      command: String.raw`C:\Windows\System32\cmd.exe`,
      commandLabel:
        'zuvix config set models.providers.openai {"apiKey":"sk test"} --strict-json',
      shell: false,
      windowsVerbatimArguments: true,
    });
  });

  it("keeps POSIX zuvix invocations direct", () => {
    expect(
      resolveUpgradeSurvivorZuvixCommand(["config", "validate"], {
        platform: "linux",
      }),
    ).toEqual({
      args: ["config", "validate"],
      command: "zuvix",
      commandLabel: "zuvix config validate",
      shell: false,
    });
  });

  it("bounds baseline config commands and reports spawn errors", () => {
    const calls: unknown[] = [];
    const timeoutError = Object.assign(new Error("spawnSync zuvix ETIMEDOUT"), {
      code: "ETIMEDOUT",
    });

    const outcome = runUpgradeSurvivorZuvixStep(
      {
        argv: ["config", "validate"],
        id: "validate",
        intent: "validate",
      },
      {
        spawnSyncCommand(command: string, args: string[], options: unknown) {
          calls.push({ args, command, options });
          return {
            error: timeoutError,
            signal: "SIGTERM",
            status: null,
            stderr: "still validating",
            stdout: "partial output",
          };
        },
      },
    );

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      args: ["config", "validate"],
      command: "zuvix",
      options: {
        killSignal: "SIGTERM",
        maxBuffer: CONFIG_COMMAND_MAX_BUFFER_BYTES,
        timeout: CONFIG_COMMAND_TIMEOUT_MS,
      },
    });
    expect(outcome).toMatchObject({
      command: "zuvix config validate",
      errorCode: "ETIMEDOUT",
      errorMessage: "spawnSync zuvix ETIMEDOUT",
      ok: false,
      signal: "SIGTERM",
      status: null,
      stderr: "still validating",
      stdout: "partial output",
    });
  });
});
