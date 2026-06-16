// Covers plugin discovery threading and concurrency behavior.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginDiscoveryResult } from "./discovery.js";

const discoverZuvixPluginsMock = vi.fn();

vi.mock("./discovery.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./discovery.js")>();
  return {
    ...actual,
    discoverZuvixPlugins: (...args: unknown[]) => discoverZuvixPluginsMock(...args),
  };
});

const { loadPluginManifestRegistry } = await import("./manifest-registry.js");
const { resolveInstalledPluginIndexRegistry } =
  await import("./installed-plugin-index-registry.js");

const emptyDiscovery: PluginDiscoveryResult = { candidates: [], diagnostics: [] };

describe("discovery threading", () => {
  beforeEach(() => {
    discoverZuvixPluginsMock.mockReset();
    discoverZuvixPluginsMock.mockReturnValue(emptyDiscovery);
  });

  it("skips internal discoverZuvixPlugins when discovery is supplied", () => {
    loadPluginManifestRegistry({ discovery: emptyDiscovery });
    expect(discoverZuvixPluginsMock).not.toHaveBeenCalled();

    discoverZuvixPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ discovery: emptyDiscovery, installRecords: {} });
    expect(discoverZuvixPluginsMock).not.toHaveBeenCalled();
  });

  it("calls discoverZuvixPlugins when neither discovery nor candidates supplied", () => {
    loadPluginManifestRegistry({});
    expect(discoverZuvixPluginsMock).toHaveBeenCalledTimes(1);

    discoverZuvixPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ installRecords: {} });
    expect(discoverZuvixPluginsMock).toHaveBeenCalledTimes(1);
  });

  it("prefers explicit candidates over discovery when both are supplied", () => {
    loadPluginManifestRegistry({ candidates: [], diagnostics: [], discovery: emptyDiscovery });
    expect(discoverZuvixPluginsMock).not.toHaveBeenCalled();

    discoverZuvixPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({
      candidates: [],
      discovery: emptyDiscovery,
      installRecords: {},
    });
    expect(discoverZuvixPluginsMock).not.toHaveBeenCalled();
  });
});
