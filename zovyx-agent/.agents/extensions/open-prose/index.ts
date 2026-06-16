// Open Prose plugin entrypoint registers its Zuvix integration.
import { definePluginEntry, type ZuvixPluginApi } from "./runtime-api.js";

export default definePluginEntry({
  id: "open-prose",
  name: "OpenProse",
  description: "Plugin-shipped prose skills bundle",
  register(_api: ZuvixPluginApi) {
    // OpenProse is delivered via plugin-shipped skills.
  },
});
