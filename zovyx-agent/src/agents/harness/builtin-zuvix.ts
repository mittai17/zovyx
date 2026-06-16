/**
 * Built-in Zuvix harness registration.
 *
 * Harness selection uses this factory to expose the embedded Zuvix runtime
 * through the same AgentHarness contract as external harness plugins.
 */
import { ZUVIX_EMBEDDED_CONTEXT_ENGINE_HOST } from "../../context-engine/host-compat.js";
import { runEmbeddedAttempt } from "../embedded-agent-runner/run/attempt.js";
import type { AgentHarness } from "./types.js";

/** Creates the built-in harness backed by the embedded Zuvix agent runner. */
export function createZuvixAgentHarness(): AgentHarness {
  return {
    id: "zuvix",
    label: "Zuvix embedded agent",
    contextEngineHostCapabilities: ZUVIX_EMBEDDED_CONTEXT_ENGINE_HOST.capabilities,
    supports: () => ({ supported: true, priority: 0 }),
    runAttempt: runEmbeddedAttempt,
  };
}
