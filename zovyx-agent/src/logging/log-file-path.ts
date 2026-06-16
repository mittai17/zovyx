// Log file path helpers resolve log output paths for local runtime logs.
import path from "node:path";
import type { ZuvixConfig } from "../config/types.js";
import {
  POSIX_ZUVIX_TMP_DIR,
  resolvePreferredZuvixTmpDir,
} from "../infra/tmp-zuvix-dir.js";

// Default logger path uses the preferred tmp directory when Node fs is available.
const LOG_PREFIX = "zuvix";
const LOG_SUFFIX = ".log";

function canUseNodeFs(): boolean {
  const getBuiltinModule = (
    process as NodeJS.Process & {
      getBuiltinModule?: (id: string) => unknown;
    }
  ).getBuiltinModule;
  if (typeof getBuiltinModule !== "function") {
    return false;
  }
  try {
    return getBuiltinModule("fs") !== undefined;
  } catch {
    return false;
  }
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveDefaultRollingLogFile(date = new Date()): string {
  const logDir = canUseNodeFs() ? resolvePreferredZuvixTmpDir() : POSIX_ZUVIX_TMP_DIR;
  return path.join(logDir, `${LOG_PREFIX}-${formatLocalDate(date)}${LOG_SUFFIX}`);
}

/** Resolves the configured log file or today's rolling default log path. */
export function resolveConfiguredLogFilePath(config?: ZuvixConfig | null): string {
  return config?.logging?.file ?? resolveDefaultRollingLogFile();
}
