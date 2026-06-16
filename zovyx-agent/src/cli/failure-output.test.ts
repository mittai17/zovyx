// Failure output tests cover CLI error formatting and failure summaries.
import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "zuvix", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[zuvix] Could not start the CLI.",
      "[zuvix] Reason: config file is invalid",
      "[zuvix] Debug: set ZUVIX_DEBUG=1 to include the stack trace.",
      "[zuvix] Try: zuvix doctor",
      "[zuvix] Help: zuvix --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { ZUVIX_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[zuvix] The CLI command failed.",
      "[zuvix] Reason: boom",
      "[zuvix] Stack:",
      "[zuvix] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
