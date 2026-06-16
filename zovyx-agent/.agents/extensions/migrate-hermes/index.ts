// Migrate Hermes plugin entrypoint registers its Zuvix integration.
import { definePluginEntry } from "zuvix/plugin-sdk/plugin-entry";
import { buildHermesMigrationProvider } from "./provider.js";

export default definePluginEntry({
  id: "migrate-hermes",
  name: "Hermes Migration",
  description: "Imports Hermes state into Zuvix.",
  register(api) {
    api.registerMigrationProvider(buildHermesMigrationProvider({ runtime: api.runtime }));
  },
});
