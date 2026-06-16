/**
 * Standalone MCP server for selected built-in Zuvix tools.
 *
 * Run via: node --import tsx src/mcp/zuvix-tools-serve.ts
 * Or: bun src/mcp/zuvix-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveZuvixToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

function createZuvixToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveZuvixToolsForMcp();
  return createToolsMcpServer({ name: "zuvix-tools", tools });
}

async function serveZuvixToolsMcp(): Promise<void> {
  const server = createZuvixToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveZuvixToolsMcp().catch((err: unknown) => {
    process.stderr.write(`zuvix-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
