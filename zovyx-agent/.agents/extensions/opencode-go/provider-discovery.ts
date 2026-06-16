// Opencode Go provider module exposes offline catalog metadata to core discovery.
import type { ProviderPlugin } from "zuvix/plugin-sdk/provider-model-shared";
import { buildStaticOpencodeGoProviderConfig } from "./provider-catalog.js";

const zuvixGoProviderDiscovery: ProviderPlugin = {
  id: "zuvix-go",
  label: "Zuvix Go",
  docsPath: "/providers/models",
  auth: [],
  staticCatalog: {
    order: "simple",
    run: async () => ({
      provider: buildStaticOpencodeGoProviderConfig(),
    }),
  },
};

export default zuvixGoProviderDiscovery;
