// Doctor launchctl environment tests cover macOS gateway platform warnings for env overrides.
import { describe, expect, it, vi } from "vitest";
import type { ZuvixConfig } from "../config/config.js";
import {
  collectMacGatewayPlatformWarnings,
  collectMacLaunchAgentOverrideWarning,
  collectMacLaunchctlGatewayEnvOverrideWarning,
  collectMacStaleZuvixUpdateLaunchdJobsWarning,
  noteMacLaunchctlGatewayEnvOverrides,
  noteMacStaleZuvixUpdateLaunchdJobs,
} from "./doctor-platform-notes.js";

function requireNoteCall(noteFn: { mock: { calls: unknown[][] } }, index = 0): unknown[] {
  const call = noteFn.mock.calls[index];
  if (!call) {
    throw new Error(`expected note call ${index}`);
  }
  return call;
}

describe("noteMacLaunchctlGatewayEnvOverrides", () => {
  it("collects clear unsetenv instructions for token override", async () => {
    const getenv = vi.fn(async (name: string) =>
      name === "ZUVIX_GATEWAY_TOKEN" ? "launchctl-token" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as ZuvixConfig;

    const warning = await collectMacLaunchctlGatewayEnvOverrideWarning(cfg, {
      platform: "darwin",
      getenv,
    });

    expect(warning).toContain("Host-wide launchctl gateway auth overrides detected");
    expect(warning).toContain("ZUVIX_GATEWAY_TOKEN");
    expect(warning).toContain("launchctl unsetenv ZUVIX_GATEWAY_TOKEN");
    expect(warning).not.toContain("ZUVIX_GATEWAY_PASSWORD");
  });

  it("prints clear unsetenv instructions for token override", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async (name: string) =>
      name === "ZUVIX_GATEWAY_TOKEN" ? "launchctl-token" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as ZuvixConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(noteFn).toHaveBeenCalledTimes(1);
    expect(getenv).toHaveBeenCalledTimes(2);

    const [message, title] = requireNoteCall(noteFn);
    expect(title).toBe("Gateway (macOS)");
    expect(message).toContain("Host-wide launchctl gateway auth overrides detected");
    expect(message).toContain("Current managed Gateway installs do not need these values");
    expect(message).toContain("ZUVIX_GATEWAY_TOKEN");
    expect(message).toContain("launchctl unsetenv ZUVIX_GATEWAY_TOKEN");
    expect(message).not.toContain("ZUVIX_GATEWAY_PASSWORD");
  });

  it("does nothing when config has no gateway credentials", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async () => "launchctl-token");
    const cfg = {} as ZuvixConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(getenv).not.toHaveBeenCalled();
    expect(noteFn).not.toHaveBeenCalled();
  });

  it("treats SecretRef-backed credentials as configured", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async (name: string) =>
      name === "ZUVIX_GATEWAY_PASSWORD" ? "launchctl-password" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          password: { source: "env", provider: "default", id: "ZUVIX_GATEWAY_PASSWORD" },
        },
      },
      secrets: {
        providers: {
          default: { source: "env" },
        },
      },
    } as ZuvixConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(noteFn).toHaveBeenCalledTimes(1);
    const [message] = requireNoteCall(noteFn);
    expect(message).toContain("ZUVIX_GATEWAY_PASSWORD");
  });

  it("does nothing on non-darwin platforms", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async () => "launchctl-token");
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as ZuvixConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "linux", getenv, noteFn });

    expect(getenv).not.toHaveBeenCalled();
    expect(noteFn).not.toHaveBeenCalled();
  });
});

describe("noteMacStaleZuvixUpdateLaunchdJobs", () => {
  it("collects stale updater job cleanup guidance on macOS", async () => {
    const findJobs = vi.fn(async () => [
      {
        label: "ai.zuvix.update.2026.5.12",
        lastExitStatus: 127,
      },
      {
        label: "ai.zuvix.manual-update.1717168800",
        lastExitStatus: 0,
      },
    ]);
    const env = {
      ZUVIX_LAUNCHD_LABEL: "ai.zuvix.manual-update.gateway",
    } as NodeJS.ProcessEnv;

    const warning = await collectMacStaleZuvixUpdateLaunchdJobsWarning({
      platform: "darwin",
      findJobs,
      env,
    });

    expect(findJobs).toHaveBeenCalledWith(env);
    expect(warning).toContain("Stale Zuvix updater launchd job(s) detected");
    expect(warning).toContain("ai.zuvix.update.2026.5.12");
    expect(warning).toContain("ai.zuvix.manual-update.1717168800");
    expect(warning).toContain("launchctl remove <label>");
    expect(warning).toContain("zuvix gateway restart");
  });

  it("uses service env for gateway platform stale updater warnings", async () => {
    const serviceEnv = {
      ZUVIX_STATE_DIR: "/tmp/zuvix-daemon",
      ZUVIX_LAUNCHD_LABEL: "ai.zuvix.manual-update.gateway",
    };
    const service = {
      readCommand: vi.fn(async () => ({
        programArguments: ["/bin/node", "cli", "gateway"],
        environment: serviceEnv,
      })),
    };
    const findJobs = vi.fn(async () => []);

    await collectMacGatewayPlatformWarnings({} as ZuvixConfig, {
      platform: "darwin",
      service,
      findJobs,
    });

    expect(service.readCommand).toHaveBeenCalledTimes(1);
    expect(findJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        ZUVIX_STATE_DIR: "/tmp/zuvix-daemon",
        ZUVIX_LAUNCHD_LABEL: "ai.zuvix.manual-update.gateway",
      }),
    );
  });

  it("uses service env for doctor stale updater notes", async () => {
    const serviceEnv = {
      ZUVIX_STATE_DIR: "/tmp/zuvix-daemon",
      ZUVIX_LAUNCHD_LABEL: "ai.zuvix.manual-update.gateway",
    };
    const service = {
      readCommand: vi.fn(async () => ({
        programArguments: ["/bin/node", "cli", "doctor"],
        environment: serviceEnv,
      })),
    };
    const findJobs = vi.fn(async () => []);

    await noteMacStaleZuvixUpdateLaunchdJobs({
      platform: "darwin",
      service,
      findJobs,
    });

    expect(service.readCommand).toHaveBeenCalledTimes(1);
    expect(findJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        ZUVIX_STATE_DIR: "/tmp/zuvix-daemon",
        ZUVIX_LAUNCHD_LABEL: "ai.zuvix.manual-update.gateway",
      }),
    );
  });

  it("prints stale updater job cleanup guidance on macOS", async () => {
    const noteFn = vi.fn();
    const service = {
      readCommand: vi.fn(async () => null),
    };
    const findJobs = vi.fn(async () => [
      {
        label: "ai.zuvix.update.2026.5.12",
        lastExitStatus: 127,
      },
      {
        label: "ai.zuvix.manual-update.1717168800",
        lastExitStatus: 0,
      },
    ]);

    await noteMacStaleZuvixUpdateLaunchdJobs({
      platform: "darwin",
      service,
      findJobs,
      noteFn,
    });

    expect(findJobs).toHaveBeenCalledTimes(1);
    const [message, title] = requireNoteCall(noteFn);
    expect(title).toBe("Gateway (macOS)");
    expect(message).toContain("Stale Zuvix updater launchd job(s) detected");
    expect(message).toContain("ai.zuvix.update.2026.5.12");
    expect(message).toContain("ai.zuvix.manual-update.1717168800");
    expect(message).toContain("launchctl remove <label>");
    expect(message).toContain("zuvix gateway restart");
  });

  it("does nothing when no stale updater jobs exist", async () => {
    const noteFn = vi.fn();
    const service = {
      readCommand: vi.fn(async () => null),
    };
    const findJobs = vi.fn(async () => []);

    await noteMacStaleZuvixUpdateLaunchdJobs({
      platform: "darwin",
      service,
      findJobs,
      noteFn,
    });

    expect(noteFn).not.toHaveBeenCalled();
  });
});

describe("collectMacLaunchAgentOverrideWarning", () => {
  it("collects guidance when launch agent writes are disabled", () => {
    const warning = collectMacLaunchAgentOverrideWarning({
      platform: "darwin",
      homeDir: "/Users/tester",
      exists: (candidate) => candidate.includes("disable-launchagent"),
    });

    expect(warning).toContain("LaunchAgent writes are disabled");
    expect(warning).toContain("rm ");
    expect(warning).toContain("disable-launchagent");
  });

  it("does nothing when launch agent writes are not disabled", () => {
    expect(
      collectMacLaunchAgentOverrideWarning({
        platform: "darwin",
        homeDir: "/Users/tester",
        exists: () => false,
      }),
    ).toBeNull();
  });
});
