// Entry metadata tests cover display metadata resolution for agents and jobs.
import { describe, expect, it } from "vitest";
import { resolveEmojiAndHomepage } from "./entry-metadata.js";

describe("shared/entry-metadata", () => {
  it("prefers metadata emoji and homepage when present", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "🦀", homepage: " https://zuvix.ai " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toEqual({
      emoji: "🦀",
      homepage: "https://zuvix.ai",
    });
  });

  it("keeps metadata precedence even when metadata values are blank", () => {
    expect(
      resolveEmojiAndHomepage({
        metadata: { emoji: "", homepage: "   " },
        frontmatter: { emoji: "🙂", homepage: "https://example.com" },
      }),
    ).toStrictEqual({});
  });

  it("falls back through frontmatter homepage aliases and drops blanks", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { emoji: "🙂", website: " https://docs.zuvix.ai " },
      }),
    ).toEqual({
      emoji: "🙂",
      homepage: "https://docs.zuvix.ai",
    });
    expect(
      resolveEmojiAndHomepage({
        metadata: { homepage: "   " },
        frontmatter: { url: "   " },
      }),
    ).toStrictEqual({});
    expect(
      resolveEmojiAndHomepage({
        frontmatter: { url: " https://zuvix.ai/install " },
      }),
    ).toEqual({
      homepage: "https://zuvix.ai/install",
    });
  });

  it("does not fall back once frontmatter homepage aliases are present but blank", () => {
    expect(
      resolveEmojiAndHomepage({
        frontmatter: {
          homepage: " ",
          website: "https://docs.zuvix.ai",
          url: "https://zuvix.ai/install",
        },
      }),
    ).toStrictEqual({});
  });
});
