// Interactive surface auth tests document token precedence for remote gateway
// surfaces that need browser or control-UI access.
import { describe, expect, it } from "vitest";
import type { GatewayRemoteConfig } from "../config/types.gateway.js";
import type { ZuvixConfig } from "../config/types.zuvix.js";
import { resolveGatewayInteractiveSurfaceAuth } from "./auth-surface-resolution.js";

function remoteGatewayConfig(remote?: GatewayRemoteConfig): ZuvixConfig {
  return {
    gateway: {
      mode: "remote",
      remote: {
        url: "wss://remote.example/ws",
        ...remote,
      },
    },
  };
}

describe("resolveGatewayInteractiveSurfaceAuth", () => {
  it("uses ZUVIX_GATEWAY_TOKEN as remote interactive fallback", async () => {
    await expect(
      resolveGatewayInteractiveSurfaceAuth({
        config: remoteGatewayConfig(),
        env: {
          ZUVIX_GATEWAY_TOKEN: "env-token",
        },
        surface: "remote",
      }),
    ).resolves.toEqual({
      token: "env-token",
      password: undefined,
    });
  });

  it("keeps configured remote token ahead of ZUVIX_GATEWAY_TOKEN", async () => {
    await expect(
      resolveGatewayInteractiveSurfaceAuth({
        config: remoteGatewayConfig({ token: "remote-token" }),
        env: {
          ZUVIX_GATEWAY_TOKEN: "env-token",
        },
        surface: "remote",
      }),
    ).resolves.toEqual({
      token: "remote-token",
      password: undefined,
    });
  });

  it("falls back to ZUVIX_GATEWAY_TOKEN when the remote token ref is unresolved", async () => {
    await expect(
      resolveGatewayInteractiveSurfaceAuth({
        config: {
          ...remoteGatewayConfig({
            token: { source: "env", provider: "default", id: "MISSING_REMOTE_TOKEN" },
          }),
        },
        env: {
          ZUVIX_GATEWAY_TOKEN: "env-token",
        },
        surface: "remote",
      }),
    ).resolves.toEqual({
      token: "env-token",
      password: undefined,
    });
  });
});
