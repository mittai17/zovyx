// Gateway model-pricing config helper.
// Resolves whether cost/pricing metadata should be available to Gateway surfaces.
import type { ZuvixConfig } from "../config/types.zuvix.js";

/** Returns whether gateway model pricing/cost metadata should be shown. */
export function isGatewayModelPricingEnabled(config: ZuvixConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
