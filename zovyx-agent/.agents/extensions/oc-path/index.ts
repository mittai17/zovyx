// OC Path plugin entrypoint registers its Zuvix integration.
import { definePluginEntry } from "zuvix/plugin-sdk/plugin-entry";
import { registerOcPathCli } from "./cli-registration.js";

export default definePluginEntry({
  id: "oc-path",
  name: "OC Path",
  description: "Adds the zuvix path CLI for oc:// workspace file addressing.",
  register(api) {
    registerOcPathCli(api);
  },
});
