// Secret input tests cover provider credential prompt normalization.
import { describe, expect, it } from "vitest";
import type { ZuvixConfig } from "../config/config.js";
import { resolveSetupSecretInputString } from "./setup.secret-input.js";

function makeConfig(): ZuvixConfig {
  return {
    secrets: {
      providers: {
        default: { source: "env" },
      },
    },
  } as ZuvixConfig;
}

describe("resolveSetupSecretInputString", () => {
  it("resolves env-template SecretInput strings", async () => {
    const resolved = await resolveSetupSecretInputString({
      config: makeConfig(),
      value: "${ZUVIX_GATEWAY_PASSWORD}",
      path: "gateway.auth.password",
      env: {
        ZUVIX_GATEWAY_PASSWORD: "gateway-secret", // pragma: allowlist secret
      },
    });

    expect(resolved).toBe("gateway-secret");
  });

  it("returns plaintext strings when value is not a SecretRef", async () => {
    const resolved = await resolveSetupSecretInputString({
      config: makeConfig(),
      value: "plain-text",
      path: "gateway.auth.password",
    });

    expect(resolved).toBe("plain-text");
  });

  it("throws with path context when env-template SecretRef cannot resolve", async () => {
    await expect(
      resolveSetupSecretInputString({
        config: makeConfig(),
        value: "${ZUVIX_GATEWAY_PASSWORD}",
        path: "gateway.auth.password",
        env: {},
      }),
    ).rejects.toThrow(
      'gateway.auth.password: failed to resolve SecretRef "env:default:ZUVIX_GATEWAY_PASSWORD"',
    );
  });
});
