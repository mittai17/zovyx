// Verifies bundled capability runtime registration from plugin metadata.
import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["zuvix/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@zuvix/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["zuvix/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@zuvix/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["zuvix/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@zuvix/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["zuvix/plugin-sdk/speech-core"]).toBe(
      aliasMap["@zuvix/plugin-sdk/speech-core"],
    );
  });
});
