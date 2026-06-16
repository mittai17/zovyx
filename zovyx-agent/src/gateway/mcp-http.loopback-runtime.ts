// Process-local MCP loopback runtime state for owner/non-owner HTTP access.
type McpLoopbackRuntime = {
  port: number;
  ownerToken: string;
  nonOwnerToken: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

/** Return a copy of the active loopback runtime, if one has been installed. */
export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

/** Install the active loopback runtime used by in-process MCP callers. */
export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

/** Choose the bearer token matching owner/non-owner caller identity. */
export function resolveMcpLoopbackBearerToken(
  runtime: McpLoopbackRuntime,
  senderIsOwner: boolean,
): string {
  return senderIsOwner ? runtime.ownerToken : runtime.nonOwnerToken;
}

/** Clear loopback runtime only when the owning token matches the active runtime. */
export function clearActiveMcpLoopbackRuntimeByOwnerToken(ownerToken: string): void {
  if (activeRuntime?.ownerToken === ownerToken) {
    activeRuntime = undefined;
  }
}

/** Build the MCP server config injected into agents for loopback tool access. */
export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      zuvix: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${ZUVIX_MCP_TOKEN}",
          "x-session-key": "${ZUVIX_MCP_SESSION_KEY}",
          "x-zuvix-agent-id": "${ZUVIX_MCP_AGENT_ID}",
          "x-zuvix-account-id": "${ZUVIX_MCP_ACCOUNT_ID}",
          "x-zuvix-message-channel": "${ZUVIX_MCP_MESSAGE_CHANNEL}",
          "x-zuvix-current-channel-id": "${ZUVIX_MCP_CURRENT_CHANNEL_ID}",
          "x-zuvix-current-thread-ts": "${ZUVIX_MCP_CURRENT_THREAD_TS}",
          "x-zuvix-current-message-id": "${ZUVIX_MCP_CURRENT_MESSAGE_ID}",
          "x-zuvix-current-inbound-audio": "${ZUVIX_MCP_CURRENT_INBOUND_AUDIO}",
          "x-zuvix-inbound-event-kind": "${ZUVIX_MCP_INBOUND_EVENT_KIND}",
          "x-zuvix-source-reply-delivery-mode": "${ZUVIX_MCP_SOURCE_REPLY_DELIVERY_MODE}",
          "x-zuvix-require-explicit-message-target":
            "${ZUVIX_MCP_REQUIRE_EXPLICIT_MESSAGE_TARGET}",
        },
      },
    },
  };
}
