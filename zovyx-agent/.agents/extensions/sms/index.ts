// Sms plugin entrypoint registers its Zuvix integration.
import { defineBundledChannelEntry } from "zuvix/plugin-sdk/channel-entry-contract";

export default defineBundledChannelEntry({
  id: "sms",
  name: "SMS",
  description: "Twilio SMS channel plugin for Zuvix text messages.",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "smsPlugin",
  },
  runtime: {
    specifier: "./api.js",
    exportName: "setSmsRuntime",
  },
});
