// Opencode Go provider module implements model/runtime integration.
import {
  describeImageWithModel,
  describeImagesWithModel,
  type MediaUnderstandingProvider,
} from "zuvix/plugin-sdk/media-understanding";

export const zuvixGoMediaUnderstandingProvider: MediaUnderstandingProvider = {
  id: "zuvix-go",
  capabilities: ["image"],
  defaultModels: {
    image: "kimi-k2.6",
  },
  describeImage: describeImageWithModel,
  describeImages: describeImagesWithModel,
};
