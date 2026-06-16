// Daemon runtime hint tests cover platform-specific daemon guidance.
import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          ZUVIX_STATE_DIR: "/tmp/zuvix-state",
          ZUVIX_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "zuvix-gateway",
        windowsTaskName: "Zuvix Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/zuvix/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/zuvix-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          ZUVIX_STATE_DIR: "/tmp/zuvix-state",
        },
        systemdServiceName: "zuvix-gateway",
        windowsTaskName: "Zuvix Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u zuvix-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/zuvix-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          ZUVIX_STATE_DIR: "/tmp/zuvix-state",
        },
        systemdServiceName: "zuvix-gateway",
        windowsTaskName: "Zuvix Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "Zuvix Gateway" /V /FO LIST',
      "Restart attempts: /tmp/zuvix-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "zuvix gateway install",
        startCommand: "zuvix gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.zuvix.gateway.plist",
        systemdServiceName: "zuvix-gateway",
        windowsTaskName: "Zuvix Gateway",
      }),
    ).toEqual([
      "zuvix gateway install",
      "zuvix gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.zuvix.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "zuvix gateway install",
        startCommand: "zuvix gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.zuvix.gateway.plist",
        systemdServiceName: "zuvix-gateway",
        windowsTaskName: "Zuvix Gateway",
      }),
    ).toEqual([
      "zuvix gateway install",
      "zuvix gateway",
      "systemctl --user start zuvix-gateway.service",
    ]);
  });
});
