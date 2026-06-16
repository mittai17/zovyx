// Discord plugin module implements preflight audio behavior.
import { transcribeFirstAudio as transcribeFirstAudioImpl } from "zuvix/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("zuvix/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
