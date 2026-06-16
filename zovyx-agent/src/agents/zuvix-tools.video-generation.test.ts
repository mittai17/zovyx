// Verifies video-generation tool registration through the shared generation harness.
import { describeZuvixGenerationToolRegistration } from "./zuvix-tools.generation.test-support.js";

describeZuvixGenerationToolRegistration({
  suiteName: "zuvix tools video generation registration",
  toolName: "video_generate",
  toolLabel: "a video-generation tool",
});
