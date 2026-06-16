// Qa Matrix plugin entrypoint registers its Zuvix integration.
import { definePluginEntry } from "zuvix/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "qa-matrix",
  name: "QA Matrix",
  description: "Matrix QA transport runner and substrate",
  register() {},
});
