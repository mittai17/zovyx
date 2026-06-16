// Plugin Package Contract tests cover index behavior.
import { describe, expect, it } from "vitest";
import {
  EXTERNAL_CODE_PLUGIN_REQUIRED_FIELD_PATHS,
  listMissingExternalCodePluginFieldPaths,
  normalizeExternalPluginCompatibility,
  validateExternalCodePluginPackageJson,
} from "./index.js";

describe("@zuvix/plugin-package-contract", () => {
  it("normalizes the Zuvix compatibility block for external plugins", () => {
    expect(
      normalizeExternalPluginCompatibility({
        version: "1.2.3",
        zuvix: {
          compat: {
            pluginApi: ">=2026.3.24-beta.2",
            minGatewayVersion: "2026.3.24-beta.2",
          },
          build: {
            zuvixVersion: "2026.3.24-beta.2",
            pluginSdkVersion: "0.9.0",
          },
        },
      }),
    ).toEqual({
      pluginApiRange: ">=2026.3.24-beta.2",
      builtWithZuvixVersion: "2026.3.24-beta.2",
      pluginSdkVersion: "0.9.0",
      minGatewayVersion: "2026.3.24-beta.2",
    });
  });

  it("falls back to install.minHostVersion and package version when compatible", () => {
    expect(
      normalizeExternalPluginCompatibility({
        version: "1.2.3",
        zuvix: {
          compat: {
            pluginApi: ">=1.0.0",
          },
          install: {
            minHostVersion: "2026.3.24-beta.2",
          },
        },
      }),
    ).toEqual({
      pluginApiRange: ">=1.0.0",
      builtWithZuvixVersion: "1.2.3",
      minGatewayVersion: "2026.3.24-beta.2",
    });
  });

  it("lists the required external code-plugin fields", () => {
    expect(EXTERNAL_CODE_PLUGIN_REQUIRED_FIELD_PATHS).toEqual([
      "zuvix.compat.pluginApi",
      "zuvix.build.zuvixVersion",
    ]);
  });

  it("reports missing required fields with stable field paths", () => {
    const packageJson = {
      zuvix: {
        compat: {},
        build: {},
      },
    };

    expect(listMissingExternalCodePluginFieldPaths(packageJson)).toEqual([
      "zuvix.compat.pluginApi",
      "zuvix.build.zuvixVersion",
    ]);
    expect(validateExternalCodePluginPackageJson(packageJson).issues).toEqual([
      {
        fieldPath: "zuvix.compat.pluginApi",
        message: "zuvix.compat.pluginApi is required for external code plugin packages.",
      },
      {
        fieldPath: "zuvix.build.zuvixVersion",
        message: "zuvix.build.zuvixVersion is required for external code plugin packages.",
      },
    ]);
  });
});
