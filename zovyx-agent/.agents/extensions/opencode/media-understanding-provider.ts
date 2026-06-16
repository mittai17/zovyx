// Opencode provider module implements model/runtime integration.
import type { ProviderStreamOptions } from "zuvix/plugin-sdk/llm";
import {
  describeImageWithModelPayloadTransform,
  describeImagesWithModelPayloadTransform,
  type MediaUnderstandingProvider,
} from "zuvix/plugin-sdk/media-understanding";
import { isRecord } from "zuvix/plugin-sdk/string-coerce-runtime";

export function stripOpencodeDisabledResponsesReasoningPayload(payload: unknown): void {
  if (!isRecord(payload)) {
    return;
  }
  const reasoning = payload.reasoning;
  if (reasoning === "none") {
    delete payload.reasoning;
    return;
  }
  if (!isRecord(reasoning) || reasoning.effort !== "none") {
    return;
  }
  delete payload.reasoning;
}

const stripDisabledResponsesReasoning: ProviderStreamOptions["onPayload"] = (payload) => {
  stripOpencodeDisabledResponsesReasoningPayload(payload);
  return undefined;
};

export const zuvixMediaUnderstandingProvider: MediaUnderstandingProvider = {
  id: "zuvix",
  capabilities: ["image"],
  defaultModels: {
    image: "gpt-5-nano",
  },
  describeImage: (request) =>
    describeImageWithModelPayloadTransform(request, stripDisabledResponsesReasoning),
  describeImages: (request) =>
    describeImagesWithModelPayloadTransform(request, stripDisabledResponsesReasoning),
};
