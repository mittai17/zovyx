import { describe, expect, it } from "vitest";
import { parseArgs } from "../../scripts/docs-sync-publish.mjs";

describe("docs-sync-publish", () => {
  it("parses docs sync provenance args", () => {
    expect(
      parseArgs([
        "--target",
        "generated-docs",
        "--source-repo",
        "zuvix/zuvix",
        "--source-sha",
        "abc123",
        "--clawhub-repo",
        "../clawhub",
        "--clawhub-source-repo",
        "zuvix/clawhub",
        "--clawhub-source-sha",
        "def456",
      ]),
    ).toMatchObject({
      clawhubRepo: "../clawhub",
      clawhubSourceRepo: "zuvix/clawhub",
      clawhubSourceSha: "def456",
      sourceRepo: "zuvix/zuvix",
      sourceSha: "abc123",
      target: "generated-docs",
    });
  });

  it("rejects missing docs sync option values", () => {
    for (const flag of [
      "--target",
      "--source-repo",
      "--source-sha",
      "--clawhub-repo",
      "--clawhub-source-repo",
      "--clawhub-source-sha",
    ]) {
      expect(() => parseArgs([flag])).toThrow(`${flag} requires a value`);
      expect(() => parseArgs([flag, "--target", "generated-docs"])).toThrow(
        `${flag} requires a value`,
      );
    }
  });
});
