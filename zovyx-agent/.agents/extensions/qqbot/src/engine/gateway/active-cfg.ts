/**
 * Active runtime config provider for the QQBot engine.
 *
 * Routing must re-evaluate `bindings[]` on every inbound message so that
 * peer/account binding edits made via the CLI take effect without
 * restarting the gateway. The provider hides the per-event lookup
 * behind a typed seam and falls back to the startup snapshot when the
 * runtime registry getter throws (e.g. snapshot not yet initialised).
 *
 * Issue #69546.
 */

import type { ZuvixConfig } from "zuvix/plugin-sdk/core";
import { getRuntimeConfig } from "zuvix/plugin-sdk/runtime-config-snapshot";

export type GatewayCfg = ZuvixConfig;

export type GatewayCfgLoader = () => ZuvixConfig;

export interface ActiveCfgProvider {
  getActiveCfg(): ZuvixConfig;
}

export interface ActiveCfgProviderOptions {
  fallback: ZuvixConfig;
  load?: GatewayCfgLoader;
}

export function createActiveCfgProvider(options: ActiveCfgProviderOptions): ActiveCfgProvider {
  const loader = options.load ?? defaultGatewayCfgLoader;
  const fallback = options.fallback;
  return {
    getActiveCfg(): ZuvixConfig {
      return resolveActiveCfg(loader, fallback);
    },
  };
}

export function resolveActiveCfg(
  loader: GatewayCfgLoader,
  fallback: ZuvixConfig,
): ZuvixConfig {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function defaultGatewayCfgLoader(): ZuvixConfig {
  return getRuntimeConfig();
}
