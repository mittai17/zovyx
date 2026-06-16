// Tests ACP install hint detection and command guidance.
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ZuvixConfig } from "../../../config/config.js";
import { resolveAcpInstallCommandHint } from "./install-hints.js";

function withAcpConfig(acp: ZuvixConfig["acp"]): ZuvixConfig {
  return { acp } as ZuvixConfig;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ACP install hints", () => {
  it("prefers explicit runtime install command", () => {
    const cfg = withAcpConfig({
      runtime: { installCommand: "pnpm zuvix plugins install acpx" },
    });
    expect(resolveAcpInstallCommandHint(cfg)).toBe("pnpm zuvix plugins install acpx");
  });

  it("uses local acpx extension path when present", () => {
    const repoRoot = process.cwd();
    const cfg = withAcpConfig({ backend: "acpx" });
    const hint = resolveAcpInstallCommandHint(cfg);
    expect(hint).toBe(`zuvix plugins install ${path.join(repoRoot, "extensions", "acpx")}`);
  });

  it("falls back to scoped install hint for acpx when local extension is absent", () => {
    vi.spyOn(process, "cwd").mockReturnValue(path.join(process.cwd(), "missing-workspace"));

    const cfg = withAcpConfig({ backend: "acpx" });
    expect(resolveAcpInstallCommandHint(cfg)).toBe("zuvix plugins install acpx");
  });

  it("returns generic plugin hint for non-acpx backend", () => {
    const cfg = withAcpConfig({ backend: "custom-backend" });
    expect(resolveAcpInstallCommandHint(cfg)).toBe(
      'Install and enable the plugin that provides ACP backend "custom-backend".',
    );
  });
});
