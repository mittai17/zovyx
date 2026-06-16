/**
 * Session config fixtures.
 *
 * Shared builders for agent/session tests that need configured session scope.
 */
import type { ZuvixConfig } from "../../config/types.zuvix.js";

/** Builds a per-sender session config with optional targeted overrides. */
export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<ZuvixConfig["session"]>> = {},
): NonNullable<ZuvixConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
