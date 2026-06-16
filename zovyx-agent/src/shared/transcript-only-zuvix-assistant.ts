// Identifies Zuvix-authored assistant rows that are transcript bookkeeping,
// not provider model output. Some history surfaces keep gateway-injected rows
// visible, so use the narrower delivery-mirror predicate when visibility matters.
export const TRANSCRIPT_ONLY_ZUVIX_ASSISTANT_MODELS = new Set<string>([
  "delivery-mirror",
  "gateway-injected",
]);

export function isTranscriptOnlyZuvixAssistantModel(provider: unknown, model: unknown): boolean {
  return (
    provider === "zuvix" &&
    typeof model === "string" &&
    TRANSCRIPT_ONLY_ZUVIX_ASSISTANT_MODELS.has(model)
  );
}

export function isTranscriptOnlyZuvixAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    isTranscriptOnlyZuvixAssistantModel(entry.provider, entry.model)
  );
}

export function isZuvixDeliveryMirrorAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" && entry.provider === "zuvix" && entry.model === "delivery-mirror"
  );
}
