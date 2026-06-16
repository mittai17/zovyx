// Systemd unit tests cover generated systemd unit files.
import { describe, expect, it } from "vitest";
import { buildSystemdUnit } from "./systemd-unit.js";

describe("buildSystemdUnit", () => {
  it("quotes arguments with whitespace", () => {
    const unit = buildSystemdUnit({
      description: "Zuvix Gateway",
      programArguments: ["/usr/bin/zuvix", "gateway", "--name", "My Bot"],
      environment: {},
    });
    const execStart = unit.split("\n").find((line) => line.startsWith("ExecStart="));
    expect(execStart).toBe('ExecStart=/usr/bin/zuvix gateway --name "My Bot"');
  });

  it("renders control-group kill mode for child-process cleanup", () => {
    const unit = buildSystemdUnit({
      description: "Zuvix Gateway",
      programArguments: ["/usr/bin/zuvix", "gateway", "run"],
      environment: {},
    });
    expect(unit).toContain("KillMode=control-group");
    expect(unit).toContain("TimeoutStopSec=30");
    expect(unit).toContain("TimeoutStartSec=30");
    expect(unit).toContain("SuccessExitStatus=0 143");
    expect(unit).toContain("StartLimitBurst=5");
    expect(unit).toContain("StartLimitIntervalSec=60");
    expect(unit).toContain("RestartPreventExitStatus=78");
  });

  it("rejects environment values with line breaks", () => {
    expect(() =>
      buildSystemdUnit({
        description: "Zuvix Gateway",
        programArguments: ["/usr/bin/zuvix", "gateway", "start"],
        environment: {
          INJECT: "ok\nExecStartPre=/bin/touch /tmp/oc15789_rce",
        },
      }),
    ).toThrow(/CR or LF/);
  });

  it("renders EnvironmentFile entries before inline Environment values", () => {
    const unit = buildSystemdUnit({
      description: "Zuvix Gateway",
      programArguments: ["/usr/bin/zuvix", "gateway", "run"],
      environmentFiles: ["/home/test/.zuvix/.env"],
      environment: {
        ZUVIX_GATEWAY_PORT: "18789",
      },
    });
    expect(unit).toContain("EnvironmentFile=-/home/test/.zuvix/.env");
    expect(unit).toContain("Environment=ZUVIX_GATEWAY_PORT=18789");
    expect(unit.indexOf("EnvironmentFile=-/home/test/.zuvix/.env")).toBeLessThan(
      unit.indexOf("Environment=ZUVIX_GATEWAY_PORT=18789"),
    );
  });
});
