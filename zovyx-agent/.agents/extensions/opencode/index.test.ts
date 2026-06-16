// Opencode tests cover index plugin behavior.
import {
  registerProviderPlugin,
  requireRegisteredProvider,
} from "zuvix/plugin-sdk/plugin-test-runtime";
import { expectPassthroughReplayPolicy } from "zuvix/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";
import plugin from "./index.js";

describe("zuvix provider plugin", () => {
  it("registers image media understanding through the Zuvix plugin", async () => {
    const { mediaProviders } = await registerProviderPlugin({
      plugin,
      id: "zuvix",
      name: "Zuvix Zen Provider",
    });

    const mediaProvider = mediaProviders.find((provider) => provider.id === "zuvix");
    if (!mediaProvider) {
      throw new Error("Expected zuvix media provider");
    }
    expect(mediaProvider.capabilities).toEqual(["image"]);
    expect(mediaProvider.defaultModels).toEqual({ image: "gpt-5-nano" });
    expect(typeof mediaProvider.describeImage).toBe("function");
    expect(typeof mediaProvider.describeImages).toBe("function");
  });

  it("owns passthrough-gemini replay policy for Gemini-backed models", async () => {
    await expectPassthroughReplayPolicy({
      plugin,
      providerId: "zuvix",
      modelId: "gemini-2.5-pro",
      sanitizeThoughtSignatures: true,
    });
  });

  it("keeps non-Gemini replay policy minimal on passthrough routes", async () => {
    await expectPassthroughReplayPolicy({
      plugin,
      providerId: "zuvix",
      modelId: "claude-opus-4.6",
    });
  });

  it("exposes Anthropic thinking levels for proxied Claude models", async () => {
    const { providers } = await registerProviderPlugin({
      plugin,
      id: "zuvix",
      name: "Zuvix Zen Provider",
    });
    const provider = requireRegisteredProvider(providers, "zuvix");
    const resolveThinkingProfile = provider.resolveThinkingProfile;
    if (!resolveThinkingProfile) {
      throw new Error("Expected Zuvix provider resolveThinkingProfile");
    }

    const opus47Profile = resolveThinkingProfile({
      provider: "zuvix",
      modelId: "claude-opus-4-7",
    });
    const opus47LevelIds = opus47Profile?.levels.map((level) => level.id) ?? [];
    expect(opus47Profile?.defaultLevel).toBe("off");
    expect(opus47LevelIds).toContain("xhigh");
    expect(opus47LevelIds).toContain("adaptive");
    expect(opus47LevelIds).toContain("max");
    const opus46Profile = resolveThinkingProfile({
      provider: "zuvix",
      modelId: "claude-opus-4.6",
    });
    const opus46LevelIds = opus46Profile?.levels.map((level) => level.id) ?? [];
    expect(opus46Profile?.defaultLevel).toBe("adaptive");
    expect(opus46LevelIds).toContain("adaptive");
    expect(opus46LevelIds).not.toContain("xhigh");
    expect(opus46LevelIds).not.toContain("max");
    const sonnet46Profile = resolveThinkingProfile({
      provider: "zuvix",
      modelId: "claude-sonnet-4-6",
    });
    const sonnet46LevelIds = sonnet46Profile?.levels.map((level) => level.id) ?? [];
    expect(sonnet46Profile?.defaultLevel).toBe("adaptive");
    expect(sonnet46LevelIds).toContain("adaptive");
    expect(sonnet46LevelIds).not.toContain("xhigh");
    expect(sonnet46LevelIds).not.toContain("max");
  });
});
