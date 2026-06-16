// Opencode Go tests cover media understanding provider plugin behavior.
import { describe, expect, it } from "vitest";
import { zuvixGoMediaUnderstandingProvider } from "./media-understanding-provider.js";

describe("zuvix-go media understanding provider", () => {
  it("declares image understanding support", () => {
    expect(zuvixGoMediaUnderstandingProvider.id).toBe("zuvix-go");
    expect(zuvixGoMediaUnderstandingProvider.capabilities).toEqual(["image"]);
    expect(zuvixGoMediaUnderstandingProvider.defaultModels).toEqual({ image: "kimi-k2.6" });
    expect(typeof zuvixGoMediaUnderstandingProvider.describeImage).toBe("function");
    expect(typeof zuvixGoMediaUnderstandingProvider.describeImages).toBe("function");
  });
});
