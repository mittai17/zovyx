// Tests package tag parsing and stable release tag behavior.
import { describe, expect, it } from "vitest";
import { normalizePackageTagInput } from "./package-tag.js";

describe("normalizePackageTagInput", () => {
  const packageNames = ["zuvix", "@zuvix/plugin"] as const;

  it.each([
    { input: undefined, expected: null },
    { input: "   ", expected: null },
    { input: "zuvix@beta", expected: "beta" },
    { input: "@zuvix/plugin@2026.2.24", expected: "2026.2.24" },
    { input: "zuvix@   ", expected: null },
    { input: "zuvix", expected: null },
    { input: " @zuvix/plugin ", expected: null },
    { input: " latest ", expected: "latest" },
    { input: "@other/plugin@beta", expected: "@other/plugin@beta" },
    { input: "zuvixer@beta", expected: "zuvixer@beta" },
  ] satisfies ReadonlyArray<{ input: string | undefined; expected: string | null }>)(
    "normalizes %j",
    ({ input, expected }) => {
      expect(normalizePackageTagInput(input, packageNames)).toBe(expected);
    },
  );
});
