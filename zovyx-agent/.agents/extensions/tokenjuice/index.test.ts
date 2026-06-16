// Tokenjuice tests cover index plugin behavior.
import fs from "node:fs";
import { createTestPluginApi } from "zuvix/plugin-sdk/plugin-test-api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tokenjuiceFactory, createTokenjuiceZuvixEmbeddedExtension } = vi.hoisted(() => {
  const tokenjuiceFactoryLocal = vi.fn();
  const createTokenjuiceZuvixEmbeddedExtensionLocal = vi.fn(() => tokenjuiceFactoryLocal);
  return {
    tokenjuiceFactory: tokenjuiceFactoryLocal,
    createTokenjuiceZuvixEmbeddedExtension: createTokenjuiceZuvixEmbeddedExtensionLocal,
  };
});

vi.mock("./runtime-api.js", () => ({
  createTokenjuiceZuvixEmbeddedExtension,
}));

import plugin from "./index.js";

describe("tokenjuice plugin", () => {
  beforeEach(() => {
    createTokenjuiceZuvixEmbeddedExtension.mockClear();
    tokenjuiceFactory.mockClear();
  });

  it("is opt-in by default", () => {
    const manifest = JSON.parse(
      fs.readFileSync(new URL("./zuvix.plugin.json", import.meta.url), "utf8"),
    ) as { enabledByDefault?: unknown };

    expect(manifest.enabledByDefault).toBeUndefined();
  });

  it("registers tokenjuice tool result middleware for Zuvix and Codex runtimes", () => {
    const registerAgentToolResultMiddleware = vi.fn();

    plugin.register(
      createTestPluginApi({
        id: "tokenjuice",
        name: "tokenjuice",
        source: "test",
        config: {},
        pluginConfig: {},
        runtime: {} as never,
        registerAgentToolResultMiddleware,
      }),
    );

    expect(createTokenjuiceZuvixEmbeddedExtension).toHaveBeenCalledTimes(1);
    expect(tokenjuiceFactory).toHaveBeenCalledTimes(1);
    const registration = registerAgentToolResultMiddleware.mock.calls[0];
    expect(typeof registration?.[0]).toBe("function");
    expect(registration?.[1]).toEqual({ runtimes: ["zuvix", "codex"] });
  });
});
