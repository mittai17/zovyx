// Text format tests cover command-facing shortening helpers.
import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("zuvix", 16)).toBe("zuvix");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("zuvix-status-output", 10)).toBe("zuvix-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
