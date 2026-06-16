// Opencode tests cover onboard plugin behavior.
import {
  expectProviderOnboardAllowlistAlias,
  expectProviderOnboardPrimaryAndFallbacks,
} from "zuvix/plugin-sdk/provider-test-contracts";
import { describe, it } from "vitest";
import { applyOpencodeZenConfig, applyOpencodeZenProviderConfig } from "./onboard.js";

const MODEL_REF = "zuvix/claude-opus-4-6";

describe("zuvix onboard", () => {
  it("adds allowlist entry and preserves alias", () => {
    expectProviderOnboardAllowlistAlias({
      applyProviderConfig: applyOpencodeZenProviderConfig,
      modelRef: MODEL_REF,
      alias: "My Opus",
    });
  });

  it("sets primary model and preserves existing model fallbacks", () => {
    expectProviderOnboardPrimaryAndFallbacks({
      applyConfig: applyOpencodeZenConfig,
      modelRef: MODEL_REF,
    });
  });
});
