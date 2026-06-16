// Command registration policy tests cover CLI registration boundaries and duplicate guards.
import { describe, expect, it } from "vitest";
import {
  shouldEagerRegisterSubcommands,
  shouldRegisterPrimaryCommandOnly,
  shouldRegisterPrimarySubcommandOnly,
  shouldSkipPluginCommandRegistration,
} from "./command-registration-policy.js";

describe("command-registration-policy", () => {
  it("matches primary command registration policy", () => {
    expect(shouldRegisterPrimaryCommandOnly(["node", "zuvix", "status"])).toBe(true);
    expect(shouldRegisterPrimaryCommandOnly(["node", "zuvix", "status", "--help"])).toBe(true);
    expect(shouldRegisterPrimaryCommandOnly(["node", "zuvix", "-V"])).toBe(false);
    expect(shouldRegisterPrimaryCommandOnly(["node", "zuvix", "acp", "-v"])).toBe(true);
  });

  it("matches plugin registration skip policy", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "--help"],
        primary: null,
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "config", "--help"],
        primary: "config",
        hasBuiltinPrimary: true,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "voicecall", "--help"],
        primary: "voicecall",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "help", "--help"],
        primary: "help",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "help", "voicecall"],
        primary: "help",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "auth", "login"],
        primary: "auth",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "tool", "image_generate"],
        primary: "tool",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "tools", "effective"],
        primary: "tools",
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "zuvix", "googlemeet", "login"],
        primary: "googlemeet",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
  });

  it("matches lazy subcommand registration policy", () => {
    expect(shouldEagerRegisterSubcommands({ ZUVIX_DISABLE_LAZY_SUBCOMMANDS: "1" })).toBe(true);
    expect(shouldEagerRegisterSubcommands({ ZUVIX_DISABLE_LAZY_SUBCOMMANDS: "0" })).toBe(false);
    expect(shouldRegisterPrimarySubcommandOnly(["node", "zuvix", "acp"], {})).toBe(true);
    expect(shouldRegisterPrimarySubcommandOnly(["node", "zuvix", "acp", "--help"], {})).toBe(
      true,
    );
    expect(
      shouldRegisterPrimarySubcommandOnly(["node", "zuvix", "acp"], {
        ZUVIX_DISABLE_LAZY_SUBCOMMANDS: "1",
      }),
    ).toBe(false);
  });
});
