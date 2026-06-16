// Memory Core helper module supports tools helpers behavior.
import { expect } from "vitest";
import type { ZuvixConfig } from "../api.js";
import { createMemoryGetTool, createMemorySearchTool } from "./tools.js";

export function asZuvixConfig(config: Partial<ZuvixConfig>): ZuvixConfig {
  return config;
}

export function createDefaultMemoryToolConfig(): ZuvixConfig {
  return asZuvixConfig({ agents: { list: [{ id: "main", default: true }] } });
}

export function createMemorySearchToolOrThrow(params?: {
  config?: ZuvixConfig;
  agentId?: string;
  agentSessionKey?: string;
  oneShotCliRun?: boolean;
}) {
  const tool = createMemorySearchTool({
    config: params?.config ?? createDefaultMemoryToolConfig(),
    ...(params?.agentId ? { agentId: params.agentId } : {}),
    ...(params?.agentSessionKey ? { agentSessionKey: params.agentSessionKey } : {}),
    ...(params?.oneShotCliRun ? { oneShotCliRun: params.oneShotCliRun } : {}),
  });
  if (!tool) {
    throw new Error("tool missing");
  }
  return tool;
}

export function createMemoryGetToolOrThrow(
  config: ZuvixConfig = createDefaultMemoryToolConfig(),
) {
  const tool = createMemoryGetTool({ config });
  if (!tool) {
    throw new Error("tool missing");
  }
  return tool;
}

export function createAutoCitationsMemorySearchTool(agentSessionKey: string) {
  return createMemorySearchToolOrThrow({
    config: asZuvixConfig({
      memory: { citations: "auto" },
      agents: { list: [{ id: "main", default: true }] },
    }),
    agentSessionKey,
  });
}

export function expectUnavailableMemorySearchDetails(
  details: unknown,
  params: {
    error: string;
    warning: string;
    action: string;
  },
) {
  expect(details).toEqual({
    results: [],
    disabled: true,
    unavailable: true,
    error: params.error,
    warning: params.warning,
    action: params.action,
    debug: {
      warning: params.warning,
      action: params.action,
      error: params.error,
    },
  });
}
