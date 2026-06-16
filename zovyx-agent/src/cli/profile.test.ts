// Profile CLI tests cover profile selection, persistence, and command wiring.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "zuvix", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "zuvix",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "zuvix", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "zuvix", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "zuvix", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "zuvix", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "status", "--deep"]);
  });

  it("preserves Matrix QA --profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "zuvix",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
  });

  it("preserves Matrix QA --profile after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "zuvix", "--no-color", "qa", "matrix", "--profile=fast"]);
  });

  it("parses qa run --profile smoke-ci as a root profile", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "run",
      "--profile",
      "smoke-ci",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("smoke-ci");
    expect(res.argv).toEqual([
      "node",
      "zuvix",
      "qa",
      "run",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
  });

  it("parses qa run --profile=release self-check invocations as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "run",
      "--profile=release",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("release");
    expect(res.argv).toEqual(["node", "zuvix", "qa", "run", "--output", "qa-report.md"]);
  });

  it("preserves qa run --qa-profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "zuvix",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
  });

  it("parses arbitrary qa run --profile values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "run",
      "--profile",
      "work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "qa", "run", "--output", "qa-report.md"]);
  });

  it("parses arbitrary qa run --profile= values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "qa",
      "run",
      "--profile=work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "qa", "run", "--output", "qa-report.md"]);
  });

  it("still parses root --profile before qa run", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "--profile",
      "work",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "qa", "run", "--qa-profile", "smoke-ci"]);
  });

  it("still parses root --profile before Matrix QA", () => {
    const res = parseCliProfileArgs([
      "node",
      "zuvix",
      "--profile",
      "work",
      "qa",
      "matrix",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "zuvix", "qa", "matrix", "--fail-fast"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "zuvix", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "zuvix", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "zuvix", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "zuvix", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "zuvix", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "zuvix", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".zuvix-dev");
    expect(env.ZUVIX_PROFILE).toBe("dev");
    expect(env.ZUVIX_STATE_DIR).toBe(expectedStateDir);
    expect(env.ZUVIX_CONFIG_PATH).toBe(path.join(expectedStateDir, "zuvix.json"));
    expect(env.ZUVIX_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      ZUVIX_PROFILE: "prod",
      ZUVIX_STATE_DIR: "/custom",
      ZUVIX_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.ZUVIX_PROFILE).toBe("dev");
    expect(env.ZUVIX_STATE_DIR).toBe("/custom");
    expect(env.ZUVIX_GATEWAY_PORT).toBe("19099");
    expect(env.ZUVIX_CONFIG_PATH).toBe(path.join("/custom", "zuvix.json"));
  });

  it("uses ZUVIX_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      ZUVIX_HOME: "/srv/zuvix-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/zuvix-home");
    expect(env.ZUVIX_STATE_DIR).toBe(path.join(resolvedHome, ".zuvix-work"));
    expect(env.ZUVIX_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".zuvix-work", "zuvix.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "zuvix doctor --fix",
      env: {},
      expected: "zuvix doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "zuvix doctor --fix",
      env: { ZUVIX_PROFILE: "default" },
      expected: "zuvix doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "zuvix doctor --fix",
      env: { ZUVIX_PROFILE: "Default" },
      expected: "zuvix doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "zuvix doctor --fix",
      env: { ZUVIX_PROFILE: "bad profile" },
      expected: "zuvix doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "zuvix --profile work doctor --fix",
      env: { ZUVIX_PROFILE: "work" },
      expected: "zuvix --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "zuvix --dev doctor",
      env: { ZUVIX_PROFILE: "dev" },
      expected: "zuvix --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("zuvix doctor --fix", { ZUVIX_PROFILE: "work" })).toBe(
      "zuvix --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("zuvix doctor --fix", { ZUVIX_PROFILE: "  jbzuvix  " })).toBe(
      "zuvix --profile jbzuvix doctor --fix",
    );
  });

  it("handles command with no args after zuvix", () => {
    expect(formatCliCommand("zuvix", { ZUVIX_PROFILE: "test" })).toBe(
      "zuvix --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm zuvix doctor", { ZUVIX_PROFILE: "work" })).toBe(
      "pnpm zuvix --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("zuvix gateway status --deep", { ZUVIX_CONTAINER_HINT: "demo" }),
    ).toBe("zuvix --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("zuvix gateway status --deep", {
        ZUVIX_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("zuvix gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("zuvix doctor", {
        ZUVIX_CONTAINER_HINT: "demo",
        ZUVIX_PROFILE: "work",
      }),
    ).toBe("zuvix --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("zuvix update", { ZUVIX_CONTAINER_HINT: "demo" })).toBe(
      "zuvix update",
    );
    expect(
      formatCliCommand("pnpm zuvix update --channel beta", { ZUVIX_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm zuvix update --channel beta");
  });
});
