/**
 * Owner display settings for prompt rendering.
 *
 * Hash mode uses a dedicated prompt-display secret so auth material is never reused for owner redaction.
 */
import crypto from "node:crypto";
import { normalizeOptionalString } from "@zuvix/normalization-core/string-coerce";
import type { ZuvixConfig } from "../config/types.zuvix.js";

type OwnerDisplaySetting = {
  ownerDisplay?: "raw" | "hash";
  ownerDisplaySecret?: string;
};

type OwnerDisplaySecretResolution = {
  config: ZuvixConfig;
  generatedSecret?: string;
};

/**
 * Resolve owner display settings for prompt rendering.
 * Keep auth secrets decoupled from owner hash secrets.
 */
export function resolveOwnerDisplaySetting(config?: ZuvixConfig): OwnerDisplaySetting {
  const ownerDisplay = config?.commands?.ownerDisplay;
  if (ownerDisplay !== "hash") {
    return { ownerDisplay, ownerDisplaySecret: undefined };
  }
  return {
    ownerDisplay: "hash",
    ownerDisplaySecret: normalizeOptionalString(config?.commands?.ownerDisplaySecret),
  };
}

/**
 * Ensure hash mode has a dedicated secret.
 * Returns updated config and generated secret when autofill was needed.
 */
export function ensureOwnerDisplaySecret(
  config: ZuvixConfig,
  generateSecret: () => string = () => crypto.randomBytes(32).toString("hex"),
): OwnerDisplaySecretResolution {
  const settings = resolveOwnerDisplaySetting(config);
  if (settings.ownerDisplay !== "hash" || settings.ownerDisplaySecret) {
    return { config };
  }
  const generatedSecret = generateSecret();
  return {
    config: {
      ...config,
      commands: {
        ...config.commands,
        ownerDisplay: "hash",
        ownerDisplaySecret: generatedSecret,
      },
    },
    generatedSecret,
  };
}
