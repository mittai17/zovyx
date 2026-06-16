// Zuvix MCP tools tests cover core tool server startup and registration.
import { describe, expect, it } from "vitest";
import { resolveZuvixToolsForMcp } from "./zuvix-tools-serve.js";
import { createPluginToolsMcpHandlers } from "./plugin-tools-handlers.js";

describe("Zuvix tools MCP server", () => {
  it("exposes cron", async () => {
    const handlers = createPluginToolsMcpHandlers(resolveZuvixToolsForMcp());

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toContain("cron");
  });
});
