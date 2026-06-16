import { sendDurableMessageBatch as sendDurableMessageBatchImpl } from "zuvix/plugin-sdk/channel-outbound";
import { transcribeFirstAudio as transcribeFirstAudioImpl } from "zuvix/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("zuvix/plugin-sdk/media-runtime").transcribeFirstAudio;
type SendDurableMessageBatch =
  typeof import("zuvix/plugin-sdk/channel-outbound").sendDurableMessageBatch;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}

export async function sendDurableMessageBatch(
  ...args: Parameters<SendDurableMessageBatch>
): ReturnType<SendDurableMessageBatch> {
  return await sendDurableMessageBatchImpl(...args);
}
