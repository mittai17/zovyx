// Whatsapp plugin module implements doctor contract behavior.
import type { ChannelDoctorConfigMutation } from "zuvix/plugin-sdk/channel-contract";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: ZuvixConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
