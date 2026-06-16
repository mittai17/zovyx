// Argv tests cover CLI argument parsing helpers and platform-specific normalization.
import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isHelpOrVersionInvocation,
  isRootHelpInvocation,
  isRootVersionInvocation,
  normalizeGeneratedHelpCommandArgv,
  normalizeRootHelpTargetArgv,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "zuvix", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "zuvix", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "zuvix", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "zuvix", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "zuvix", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "zuvix", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "zuvix", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "zuvix", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "zuvix", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "known command group help command help flag",
      argv: ["node", "zuvix", "backup", "help", "--help"],
      expected: ["node", "zuvix", "backup", "help"],
    },
    {
      name: "known command group help command short help flag",
      argv: ["node", "zuvix", "--profile", "work", "backup", "help", "-h"],
      expected: ["node", "zuvix", "--profile", "work", "backup", "help"],
    },
    {
      name: "leaf positional help remains untouched",
      argv: ["node", "zuvix", "docs", "help", "--help"],
      expected: ["node", "zuvix", "docs", "help", "--help"],
    },
    {
      name: "known command group help target",
      argv: ["node", "zuvix", "plugins", "help", "list"],
      expected: ["node", "zuvix", "plugins", "list", "--help"],
    },
    {
      name: "known command group help target help flag",
      argv: ["node", "zuvix", "plugins", "help", "list", "--help"],
      expected: ["node", "zuvix", "plugins", "list", "--help"],
    },
    {
      name: "unknown plugin command group help target",
      argv: ["node", "zuvix", "external-plugin", "help", "inspect"],
      expected: ["node", "zuvix", "external-plugin", "inspect", "--help"],
    },
    {
      name: "unknown plugin command group help target help flag",
      argv: ["node", "zuvix", "external-plugin", "help", "inspect", "--help"],
      expected: ["node", "zuvix", "external-plugin", "inspect", "--help"],
    },
    {
      name: "generated help target with trailing root option",
      argv: ["node", "zuvix", "memory", "help", "status", "--no-color"],
      expected: ["node", "zuvix", "--no-color", "memory", "status", "--help"],
    },
    {
      name: "extra help positionals remain untouched",
      argv: ["node", "zuvix", "backup", "help", "missing", "extra", "--help"],
      expected: ["node", "zuvix", "backup", "help", "missing", "extra", "--help"],
    },
    {
      name: "terminator help flag remains untouched",
      argv: ["node", "zuvix", "backup", "help", "--", "--help"],
      expected: ["node", "zuvix", "backup", "help", "--", "--help"],
    },
  ])("normalizes generated help commands: $name", ({ argv, expected }) => {
    expect(normalizeGeneratedHelpCommandArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "root help target",
      argv: ["node", "zuvix", "help", "plugins"],
      expected: ["node", "zuvix", "plugins", "--help"],
    },
    {
      name: "root help target with help flag",
      argv: ["node", "zuvix", "help", "plugins", "--help"],
      expected: ["node", "zuvix", "plugins", "--help"],
    },
    {
      name: "root option before help target",
      argv: ["node", "zuvix", "--profile", "work", "help", "memory"],
      expected: ["node", "zuvix", "--profile", "work", "memory", "--help"],
    },
    {
      name: "bare root help remains untouched",
      argv: ["node", "zuvix", "help"],
      expected: ["node", "zuvix", "help"],
    },
    {
      name: "root help self-help remains untouched",
      argv: ["node", "zuvix", "help", "--help"],
      expected: ["node", "zuvix", "help", "--help"],
    },
    {
      name: "nested root help target",
      argv: ["node", "zuvix", "help", "plugins", "list"],
      expected: ["node", "zuvix", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with help flag",
      argv: ["node", "zuvix", "help", "plugins", "list", "--help"],
      expected: ["node", "zuvix", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with trailing root option",
      argv: ["node", "zuvix", "help", "memory", "status", "--no-color"],
      expected: ["node", "zuvix", "--no-color", "memory", "status", "--help"],
    },
  ])("normalizes root help targets: $name", ({ argv, expected }) => {
    expect(normalizeRootHelpTargetArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "root help command",
      argv: ["node", "zuvix", "help"],
      expected: true,
    },
    {
      name: "root help command with target",
      argv: ["node", "zuvix", "help", "matrix"],
      expected: true,
    },
    {
      name: "nested help command",
      argv: ["node", "zuvix", "matrix", "encryption", "help"],
      expected: true,
    },
    {
      name: "known subcommand root help command",
      argv: ["node", "zuvix", "config", "help"],
      expected: true,
    },
    {
      name: "known leaf command positional help",
      argv: ["node", "zuvix", "docs", "help"],
      expected: false,
    },
    {
      name: "known subcommand leaf positional help",
      argv: ["node", "zuvix", "config", "set", "some.path", "help"],
      expected: false,
    },
    {
      name: "unknown plugin command help",
      argv: ["node", "zuvix", "external-plugin", "tools", "help"],
      expected: true,
    },
    {
      name: "help flag",
      argv: ["node", "zuvix", "matrix", "encryption", "--help"],
      expected: true,
    },
    {
      name: "help as option value",
      argv: ["node", "zuvix", "agent", "--message", "help"],
      expected: false,
    },
    {
      name: "help after terminator",
      argv: ["node", "zuvix", "nodes", "invoke", "--", "help"],
      expected: false,
    },
    {
      name: "help flag after terminator",
      argv: ["node", "zuvix", "nodes", "invoke", "--", "--help"],
      expected: false,
    },
    {
      name: "version flag after terminator",
      argv: ["node", "zuvix", "nodes", "invoke", "--", "--version"],
      expected: false,
    },
  ])("detects help/version invocations: $name", ({ argv, expected }) => {
    expect(isHelpOrVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "zuvix", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "zuvix", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "zuvix", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "zuvix", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "zuvix", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "zuvix", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "zuvix", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "zuvix", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "zuvix", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "zuvix", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "zuvix", "nodes", "invoke", "--", "device.status", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "zuvix", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "zuvix", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "zuvix", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "zuvix", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "zuvix", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        [
          "node",
          "zuvix",
          "--profile",
          "work",
          "--container",
          "demo",
          "--no-color",
          "config",
          "validate",
        ],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "zuvix", "config", "get", "--log-level", "debug", "update.channel", "--json"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "zuvix", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "zuvix", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "zuvix", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "zuvix"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "zuvix", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "zuvix", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "zuvix", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "zuvix", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "zuvix", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "zuvix", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "zuvix", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "zuvix", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "zuvix", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "zuvix", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "zuvix", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "zuvix", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "zuvix", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "zuvix", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "valid signed decimal positive integer",
      argv: ["node", "zuvix", "status", "--timeout", "+5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "zuvix", "status", "--timeout", "nope"],
      expected: undefined,
    },
    {
      name: "non-decimal integer",
      argv: ["node", "zuvix", "status", "--timeout", "0x10"],
      expected: undefined,
    },
    {
      name: "partial integer",
      argv: ["node", "zuvix", "status", "--timeout", "5s"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it.each([
    {
      name: "keeps plain node argv",
      rawArgs: ["node", "zuvix", "status"],
      expected: ["node", "zuvix", "status"],
    },
    {
      name: "keeps version-suffixed node binary",
      rawArgs: ["node-22", "zuvix", "status"],
      expected: ["node-22", "zuvix", "status"],
    },
    {
      name: "keeps windows versioned node exe",
      rawArgs: ["node-22.2.0.exe", "zuvix", "status"],
      expected: ["node-22.2.0.exe", "zuvix", "status"],
    },
    {
      name: "keeps dotted node binary",
      rawArgs: ["node-22.2", "zuvix", "status"],
      expected: ["node-22.2", "zuvix", "status"],
    },
    {
      name: "keeps dotted node exe",
      rawArgs: ["node-22.2.exe", "zuvix", "status"],
      expected: ["node-22.2.exe", "zuvix", "status"],
    },
    {
      name: "keeps absolute versioned node path",
      rawArgs: ["/usr/bin/node-22.2.0", "zuvix", "status"],
      expected: ["/usr/bin/node-22.2.0", "zuvix", "status"],
    },
    {
      name: "keeps node24 shorthand",
      rawArgs: ["node24", "zuvix", "status"],
      expected: ["node24", "zuvix", "status"],
    },
    {
      name: "keeps absolute node24 shorthand",
      rawArgs: ["/usr/bin/node24", "zuvix", "status"],
      expected: ["/usr/bin/node24", "zuvix", "status"],
    },
    {
      name: "keeps windows node24 exe",
      rawArgs: ["node24.exe", "zuvix", "status"],
      expected: ["node24.exe", "zuvix", "status"],
    },
    {
      name: "keeps nodejs binary",
      rawArgs: ["nodejs", "zuvix", "status"],
      expected: ["nodejs", "zuvix", "status"],
    },
    {
      name: "prefixes fallback when first arg is not a node launcher",
      rawArgs: ["node-dev", "zuvix", "status"],
      expected: ["node", "zuvix", "node-dev", "zuvix", "status"],
    },
    {
      name: "prefixes fallback when raw args start at program name",
      rawArgs: ["zuvix", "status"],
      expected: ["node", "zuvix", "status"],
    },
    {
      name: "keeps bun execution argv",
      rawArgs: ["bun", "src/entry.ts", "status"],
      expected: ["bun", "src/entry.ts", "status"],
    },
  ] as const)("builds parse argv from raw args: $name", ({ rawArgs, expected }) => {
    const parsed = buildParseArgv({
      programName: "zuvix",
      rawArgs: [...rawArgs],
    });
    expect(parsed).toEqual([...expected]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "zuvix",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "zuvix", "status"]);
  });

  it.each([
    { argv: ["node", "zuvix", "status"], expected: true },
    { argv: ["node", "zuvix", "health"], expected: false },
    { argv: ["node", "zuvix", "sessions"], expected: false },
    { argv: ["node", "zuvix", "--profile", "work", "status"], expected: true },
    { argv: ["node", "zuvix", "--log-level=debug", "models", "list"], expected: true },
    { argv: ["node", "zuvix", "config", "get", "update"], expected: false },
    { argv: ["node", "zuvix", "config", "unset", "update"], expected: false },
    { argv: ["node", "zuvix", "models", "list"], expected: true },
    { argv: ["node", "zuvix", "models", "status"], expected: true },
    { argv: ["node", "zuvix", "update", "status", "--json"], expected: false },
    { argv: ["node", "zuvix", "agent", "--message", "hi"], expected: true },
    { argv: ["node", "zuvix", "agents", "list"], expected: true },
    { argv: ["node", "zuvix", "message", "send"], expected: true },
  ] as const)("decides when to migrate state: $argv", ({ argv, expected }) => {
    expect(shouldMigrateState([...argv])).toBe(expected);
  });

  it.each([
    { path: ["status"], expected: true },
    { path: ["update", "status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["agent"], expected: true },
    { path: ["models", "status"], expected: true },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
