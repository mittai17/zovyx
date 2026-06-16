/**
 * Tests Zuvix SDK helpers and provider-facing Zuvix contracts.
 */
import { describe, expect, it } from "vitest";
import { createOpencodeCatalogApiKeyAuthMethod } from "./zuvix.js";

describe("createOpencodeCatalogApiKeyAuthMethod", () => {
  it("locks the shared Zuvix auth contract", () => {
    const method = createOpencodeCatalogApiKeyAuthMethod({
      providerId: "zuvix-go",
      label: "Zuvix Go catalog",
      optionKey: "zuvixGoApiKey",
      flagName: "--zuvix-go-api-key",
      defaultModel: "zuvix-go/kimi-k2.6",
      applyConfig: (cfg) => cfg,
      noteMessage: "Zuvix uses one API key across the Zen and Go catalogs.",
      choiceId: "zuvix-go",
      choiceLabel: "Zuvix Go catalog",
    });

    expect(method.id).toBe("api-key");
    expect(method.label).toBe("Zuvix Go catalog");
    expect(method.hint).toBe("Shared API key for Zen + Go catalogs");
    expect(method.kind).toBe("api_key");
    if (!method.wizard) {
      throw new Error("expected Zuvix auth method to include wizard metadata");
    }
    expect(method.wizard.choiceId).toBe("zuvix-go");
    expect(method.wizard.choiceLabel).toBe("Zuvix Go catalog");
    expect(method.wizard.groupId).toBe("zuvix");
    expect(method.wizard.groupLabel).toBe("Zuvix");
    expect(method.wizard.groupHint).toBe("Shared API key for Zen + Go catalogs");
  });
});
