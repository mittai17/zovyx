// Verifies synced-folder security audit findings.
import { describe, expect, it } from "vitest";
import { collectSyncedFolderFindings } from "./audit-extra.sync.js";

describe("security audit synced folder findings", () => {
  it("warns when state/config look like a synced folder", () => {
    const findings = collectSyncedFolderFindings({
      stateDir: "/Users/test/Dropbox/.zuvix",
      configPath: "/Users/test/Dropbox/.zuvix/zuvix.json",
    });

    expect(
      findings.some(
        (finding) => finding.checkId === "fs.synced_dir" && finding.severity === "warn",
      ),
    ).toBe(true);
  });
});
