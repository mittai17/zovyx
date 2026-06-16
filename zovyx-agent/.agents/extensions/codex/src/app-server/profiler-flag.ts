/**
 * Resolves whether Codex app-server profiling instrumentation is enabled by
 * Zuvix diagnostic flags.
 */
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { isDiagnosticFlagEnabled } from "zuvix/plugin-sdk/diagnostic-runtime";

const PROFILER_FLAGS = ["profiler", "codex.profiler"] as const;

/** Checks the generic and Codex-specific profiler diagnostic flags. */
export function isCodexAppServerProfilerEnabled(
  config?: ZuvixConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PROFILER_FLAGS.some((flag) => isDiagnosticFlagEnabled(flag, config, env));
}
