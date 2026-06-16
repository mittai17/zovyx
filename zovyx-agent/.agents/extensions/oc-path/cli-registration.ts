// OC Path module implements cli registration behavior.
import type { ZuvixPluginApi } from "zuvix/plugin-sdk/plugin-entry";

export function registerOcPathCli(api: ZuvixPluginApi): void {
  api.registerCli(
    async ({ program }) => {
      const { registerPathCli } = await import("./src/cli.js");
      registerPathCli(program);
    },
    {
      descriptors: [
        {
          name: "path",
          description: "Inspect and edit workspace files via oc:// paths",
          hasSubcommands: true,
        },
      ],
    },
  );
}
