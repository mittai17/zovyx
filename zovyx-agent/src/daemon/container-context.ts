/** Detects whether a daemon was launched by Zuvix's container-aware service wrapper. */
import { normalizeOptionalString } from "@zuvix/normalization-core/string-coerce";

/** Resolves the daemon container hint exposed by managed service environments. */
export function resolveDaemonContainerContext(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return (
    normalizeOptionalString(env.ZUVIX_CONTAINER_HINT) ||
    normalizeOptionalString(env.ZUVIX_CONTAINER) ||
    null
  );
}
