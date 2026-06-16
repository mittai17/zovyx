// Opencode tests cover media understanding provider plugin behavior.
import { describe, expect, it } from "vitest";
import {
  zuvixMediaUnderstandingProvider,
  stripOpencodeDisabledResponsesReasoningPayload,
} from "./media-understanding-provider.js";

describe("zuvix media understanding provider", () => {
  it("strips disabled Responses reasoning payloads", () => {
    const payload = {
      reasoning: { effort: "none" },
      include: ["reasoning.encrypted_content"],
      store: false,
    };

    stripOpencodeDisabledResponsesReasoningPayload(payload);

    expect(payload).toEqual({
      include: ["reasoning.encrypted_content"],
      store: false,
    });
  });

  it("keeps supported Responses reasoning payloads", () => {
    const payload = {
      reasoning: { effort: "low" },
      store: false,
    };

    stripOpencodeDisabledResponsesReasoningPayload(payload);

    expect(payload).toEqual({
      reasoning: { effort: "low" },
      store: false,
    });
  });

  it("declares Zuvix image understanding support", () => {
    expect(zuvixMediaUnderstandingProvider.id).toBe("zuvix");
    expect(zuvixMediaUnderstandingProvider.capabilities).toEqual(["image"]);
    expect(zuvixMediaUnderstandingProvider.defaultModels).toEqual({ image: "gpt-5-nano" });
    expect(typeof zuvixMediaUnderstandingProvider.describeImage).toBe("function");
    expect(typeof zuvixMediaUnderstandingProvider.describeImages).toBe("function");
  });
});
