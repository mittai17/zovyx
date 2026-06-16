// Frontmatter tests cover shared Markdown frontmatter parsing helpers.
import { describe, expect, it, test } from "vitest";
import {
  applyZuvixManifestInstallCommonFields,
  getFrontmatterString,
  normalizeStringList,
  parseFrontmatterBool,
  parseZuvixManifestInstallBase,
  resolveZuvixManifestBlock,
  resolveZuvixManifestInstall,
  resolveZuvixManifestOs,
  resolveZuvixManifestRequires,
} from "./frontmatter.js";

function expectInstallBase(
  parsed: ReturnType<typeof parseZuvixManifestInstallBase>,
): NonNullable<ReturnType<typeof parseZuvixManifestInstallBase>> {
  if (parsed === undefined) {
    throw new Error("Expected manifest install base");
  }
  return parsed;
}

describe("shared/frontmatter", () => {
  test("normalizeStringList handles strings, arrays, and non-list values", () => {
    expect(normalizeStringList("a, b,,c")).toEqual(["a", "b", "c"]);
    expect(normalizeStringList([" a ", "", "b", 42])).toEqual(["a", "b", "42"]);
    expect(normalizeStringList(null)).toStrictEqual([]);
  });

  test("getFrontmatterString extracts strings only", () => {
    expect(getFrontmatterString({ a: "b" }, "a")).toBe("b");
    expect(getFrontmatterString({ a: 1 }, "a")).toBeUndefined();
  });

  test("parseFrontmatterBool respects explicit values and fallback", () => {
    expect(parseFrontmatterBool("true", false)).toBe(true);
    expect(parseFrontmatterBool("false", true)).toBe(false);
    expect(parseFrontmatterBool(undefined, true)).toBe(true);
    expect(parseFrontmatterBool("maybe", false)).toBe(false);
  });

  test("resolveZuvixManifestBlock reads current manifest keys and custom metadata fields", () => {
    expect(
      resolveZuvixManifestBlock({
        frontmatter: {
          metadata: "{ zuvix: { foo: 1, bar: 'baz' } }",
        },
      }),
    ).toEqual({ foo: 1, bar: "baz" });

    expect(
      resolveZuvixManifestBlock({
        frontmatter: {
          pluginMeta: "{ zuvix: { foo: 2 } }",
        },
        key: "pluginMeta",
      }),
    ).toEqual({ foo: 2 });
  });

  test("resolveZuvixManifestBlock reads legacy manifest keys", () => {
    expect(
      resolveZuvixManifestBlock({
        frontmatter: {
          metadata: "{ clawdbot: { requires: { bins: ['op'] }, install: [] } }",
        },
      }),
    ).toEqual({ requires: { bins: ["op"] }, install: [] });
  });

  test("resolveZuvixManifestBlock prefers current manifest keys over legacy keys", () => {
    expect(
      resolveZuvixManifestBlock({
        frontmatter: {
          metadata:
            "{ zuvix: { requires: { bins: ['current'] } }, clawdbot: { requires: { bins: ['legacy'] } } }",
        },
      }),
    ).toEqual({ requires: { bins: ["current"] } });
  });

  test("resolveZuvixManifestBlock returns undefined for invalid input", () => {
    expect(resolveZuvixManifestBlock({ frontmatter: {} })).toBeUndefined();
    expect(
      resolveZuvixManifestBlock({ frontmatter: { metadata: "not-json5" } }),
    ).toBeUndefined();
    expect(resolveZuvixManifestBlock({ frontmatter: { metadata: "123" } })).toBeUndefined();
    expect(resolveZuvixManifestBlock({ frontmatter: { metadata: "[]" } })).toBeUndefined();
    expect(
      resolveZuvixManifestBlock({ frontmatter: { metadata: "{ nope: { a: 1 } }" } }),
    ).toBeUndefined();
  });

  it("normalizes manifest requirement and os lists", () => {
    expect(
      resolveZuvixManifestRequires({
        requires: {
          bins: "bun, node",
          anyBins: [" ffmpeg ", ""],
          env: ["ZUVIX_TOKEN", " ZUVIX_URL "],
          config: null,
        },
      }),
    ).toEqual({
      bins: ["bun", "node"],
      anyBins: ["ffmpeg"],
      env: ["ZUVIX_TOKEN", "ZUVIX_URL"],
      config: [],
    });
    expect(resolveZuvixManifestRequires({})).toBeUndefined();
    expect(resolveZuvixManifestOs({ os: [" darwin ", "linux", ""] })).toEqual([
      "darwin",
      "linux",
    ]);
  });

  it("parses and applies install common fields", () => {
    const parsed = parseZuvixManifestInstallBase(
      {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      kind: "brew",
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
    expect(parseZuvixManifestInstallBase({ kind: "bad" }, ["brew"])).toBeUndefined();
    expect(
      applyZuvixManifestInstallCommonFields<{
        extra: boolean;
        id?: string;
        label?: string;
        bins?: string[];
      }>({ extra: true }, expectInstallBase(parsed)),
    ).toEqual({
      extra: true,
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
  });

  it("prefers explicit kind, ignores invalid common fields, and leaves missing ones untouched", () => {
    const parsed = parseZuvixManifestInstallBase(
      {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      kind: "npm",
    });
    expect(
      applyZuvixManifestInstallCommonFields(
        { id: "keep", label: "Keep", bins: ["bun"] },
        parsed!,
      ),
    ).toEqual({
      id: "keep",
      label: "Keep",
      bins: ["bun"],
    });
  });

  it("maps install entries through the parser and filters rejected specs", () => {
    expect(
      resolveZuvixManifestInstall(
        {
          install: [{ id: "keep" }, { id: "drop" }, "bad"],
        },
        (entry) => {
          if (
            typeof entry === "object" &&
            entry !== null &&
            (entry as { id?: string }).id === "keep"
          ) {
            return { id: "keep" };
          }
          return undefined;
        },
      ),
    ).toEqual([{ id: "keep" }]);
  });
});
