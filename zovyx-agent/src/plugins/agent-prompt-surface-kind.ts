// Normalizes agent prompt surface kinds advertised by plugins.
import type { AgentPromptSurfaceKind } from "./types.js";

/** Normalizes legacy prompt surface names to current Zuvix surface names. */
export function normalizeAgentPromptSurfaceKind(
  surface: AgentPromptSurfaceKind,
): AgentPromptSurfaceKind {
  return surface === "pi_main" ? "zuvix_main" : surface;
}

/** True when a prompt surface targets the main Zuvix prompt. */
export function isZuvixMainPromptSurface(surface: AgentPromptSurfaceKind): boolean {
  return normalizeAgentPromptSurfaceKind(surface) === "zuvix_main";
}
