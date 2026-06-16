import { afterEach, describe, expect, it } from "vitest";
import { resolveMemoryFlushContextWindowTokens } from "../auto-reply/reply/memory-flush.js";
import type { ZuvixConfig } from "../config/types.zuvix.js";
import { refreshContextWindowCache, resetContextWindowCacheForTest } from "./context.js";

describe("Zuvix Go context metadata", () => {
  afterEach(() => {
    resetContextWindowCacheForTest();
  });

  it("warms the provider-owned context window without writing model config", async () => {
    const cfg: ZuvixConfig = {};

    await refreshContextWindowCache(cfg);

    expect(
      resolveMemoryFlushContextWindowTokens({
        cfg,
        provider: "zuvix-go",
        modelId: "deepseek-v4-pro",
      }),
    ).toBe(1_000_000);
    expect(cfg.models).toBeUndefined();
  });
});
