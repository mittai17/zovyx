// Verifies image-generation tool registration through the shared generation harness.
import { describeZuvixGenerationToolRegistration } from "./zuvix-tools.generation.test-support.js";

describeZuvixGenerationToolRegistration({
  suiteName: "zuvix tools image generation registration",
  toolName: "image_generate",
  toolLabel: "an image-generation tool",
});
