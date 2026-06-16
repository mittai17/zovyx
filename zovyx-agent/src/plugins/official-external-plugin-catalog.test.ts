import { describe, expect, it } from "vitest";
import {
  type OfficialExternalPluginCatalogEntry,
  getOfficialExternalPluginCatalogEntry,
  listOfficialExternalPluginCatalogEntries,
  resolveOfficialExternalPluginId,
  resolveOfficialExternalPluginInstall,
} from "./official-external-plugin-catalog.js";

function expectCatalogEntry(id: string): OfficialExternalPluginCatalogEntry {
  const entry = getOfficialExternalPluginCatalogEntry(id);
  if (entry === undefined) {
    throw new Error(`Expected external plugin catalog entry for ${id}`);
  }
  return entry;
}

describe("official external plugin catalog", () => {
  it("resolves third-party channel lookup aliases to published plugin ids", () => {
    const wecomByChannel = expectCatalogEntry("wecom");
    const wecomByPlugin = expectCatalogEntry("wecom-zuvix-plugin");
    const yuanbaoByChannel = expectCatalogEntry("yuanbao");

    expect(resolveOfficialExternalPluginId(wecomByChannel)).toBe("wecom-zuvix-plugin");
    expect(resolveOfficialExternalPluginId(wecomByPlugin)).toBe("wecom-zuvix-plugin");
    expect(resolveOfficialExternalPluginInstall(wecomByChannel)?.npmSpec).toBe(
      "@wecom/wecom-zuvix-plugin@2026.5.7",
    );
    expect(resolveOfficialExternalPluginId(yuanbaoByChannel)).toBe("zuvix-plugin-yuanbao");
    expect(resolveOfficialExternalPluginInstall(yuanbaoByChannel)?.npmSpec).toBe(
      "zuvix-plugin-yuanbao@2.13.1",
    );
  });

  it("keeps official launch package specs on the production package names", () => {
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("acpx"))?.npmSpec).toBe(
      "@zuvix/acpx",
    );
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("googlechat"))?.npmSpec).toBe(
      "@zuvix/googlechat",
    );
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("line"))?.npmSpec).toBe(
      "@zuvix/line",
    );
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("diffs-language-pack"))).toEqual(
      {
        npmSpec: "@zuvix/diffs-language-pack",
        clawhubSpec: "clawhub:@zuvix/diffs-language-pack",
        defaultChoice: "npm",
        minHostVersion: ">=2026.5.27",
      },
    );
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("llama-cpp"))?.npmSpec).toBe(
      "@zuvix/llama-cpp-provider",
    );
  });

  it("allows invalid-config recovery for externalized stock plugins", () => {
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("brave"))).toMatchObject({
      npmSpec: "@zuvix/brave-plugin",
      allowInvalidConfigRecovery: true,
    });
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("slack"))).toMatchObject({
      npmSpec: "@zuvix/slack",
      allowInvalidConfigRecovery: true,
    });
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("discord"))).toMatchObject({
      npmSpec: "@zuvix/discord",
      allowInvalidConfigRecovery: true,
    });
  });

  it("lists Matrix as an official external ClawHub channel after cutover", () => {
    const ids = new Set<string>();
    for (const entry of listOfficialExternalPluginCatalogEntries()) {
      const pluginId = resolveOfficialExternalPluginId(entry);
      if (pluginId) {
        ids.add(pluginId);
      }
    }

    expect(ids.has("matrix")).toBe(true);
    expect(ids.has("mattermost")).toBe(false);
    expect(resolveOfficialExternalPluginInstall(expectCatalogEntry("matrix"))).toEqual({
      clawhubSpec: "clawhub:@zuvix/matrix",
      npmSpec: "@zuvix/matrix",
      defaultChoice: "clawhub",
      minHostVersion: ">=2026.4.10",
      allowInvalidConfigRecovery: true,
    });
  });
});
