/**
 * Tests agent directory compatibility helpers.
 */
import { describe, expect, it } from "vitest";
import { resolveZuvixAgentDir } from "./agent-dir-compat.js";

describe("resolveZuvixAgentDir", () => {
  it("keeps the shipped Pi env alias for deprecated plugin SDK callers", () => {
    expect(
      resolveZuvixAgentDir({
        PI_CODING_AGENT_DIR: "/tmp/zuvix-legacy-agent",
      }),
    ).toBe("/tmp/zuvix-legacy-agent");
  });

  it("prefers the Zuvix env override over the deprecated Pi alias", () => {
    expect(
      resolveZuvixAgentDir({
        ZUVIX_AGENT_DIR: "/tmp/zuvix-agent",
        PI_CODING_AGENT_DIR: "/tmp/zuvix-legacy-agent",
      }),
    ).toBe("/tmp/zuvix-agent");
  });
});
