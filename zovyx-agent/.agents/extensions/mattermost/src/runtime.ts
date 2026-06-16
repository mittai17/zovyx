// Mattermost plugin module implements runtime behavior.
import { createPluginRuntimeStore } from "zuvix/plugin-sdk/runtime-store";
import type { PluginRuntime } from "zuvix/plugin-sdk/runtime-store";

const { setRuntime: setMattermostRuntime, getRuntime: getMattermostRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "mattermost",
    errorMessage: "Mattermost runtime not initialized",
  });
export { getMattermostRuntime, setMattermostRuntime };
