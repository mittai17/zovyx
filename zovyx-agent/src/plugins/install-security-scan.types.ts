// Defines plugin install security scan result types.
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Overrides that intentionally loosen install safety policy for trusted/operator paths. */
export type InstallSafetyOverrides = {
  config?: ZuvixConfig;
  dangerouslyForceUnsafeInstall?: boolean;
  trustedSourceLinkedOfficialInstall?: boolean;
};
