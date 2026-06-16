// OpenAI model default tests cover provider-specific default model migration helpers.
import { describe, expect, it } from "vitest";
import type { ZuvixConfig } from "../config/config.js";
import {
  applyOpencodeZenModelDefault,
  OPENCODE_ZEN_DEFAULT_MODEL,
} from "../plugin-sdk/zuvix.js";

function expectPrimaryModelChanged(
  applied: { changed: boolean; next: ZuvixConfig },
  primary: string,
) {
  expect(applied.changed).toBe(true);
  expect(applied.next.agents?.defaults?.model).toEqual({ primary });
}

function expectConfigUnchanged(
  applied: { changed: boolean; next: ZuvixConfig },
  cfg: ZuvixConfig,
) {
  expect(applied.changed).toBe(false);
  expect(applied.next).toEqual(cfg);
}

describe("applyOpencodeZenModelDefault", () => {
  it("sets defaults when model is unset", () => {
    const cfg: ZuvixConfig = { agents: { defaults: {} } };
    const applied = applyOpencodeZenModelDefault(cfg);
    expectPrimaryModelChanged(applied, OPENCODE_ZEN_DEFAULT_MODEL);
  });

  it("overrides existing models", () => {
    const cfg = {
      agents: { defaults: { model: "anthropic/claude-opus-4-6" } },
    } as ZuvixConfig;
    const applied = applyOpencodeZenModelDefault(cfg);
    expectPrimaryModelChanged(applied, OPENCODE_ZEN_DEFAULT_MODEL);
  });

  it("no-ops when already legacy zuvix-zen default", () => {
    const cfg = {
      agents: { defaults: { model: "zuvix-zen/claude-opus-4-5" } },
    } as ZuvixConfig;
    const applied = applyOpencodeZenModelDefault(cfg);
    expectConfigUnchanged(applied, cfg);
  });

  it("preserves fallbacks when setting primary", () => {
    const cfg: ZuvixConfig = {
      agents: {
        defaults: {
          model: {
            primary: "anthropic/claude-opus-4-6",
            fallbacks: ["google/gemini-3-pro"],
          },
        },
      },
    };
    const applied = applyOpencodeZenModelDefault(cfg);
    expect(applied.changed).toBe(true);
    expect(applied.next.agents?.defaults?.model).toEqual({
      primary: OPENCODE_ZEN_DEFAULT_MODEL,
      fallbacks: ["google/gemini-3.1-pro-preview"],
    });
  });

  it("no-ops when already on the current default", () => {
    const cfg = {
      agents: { defaults: { model: OPENCODE_ZEN_DEFAULT_MODEL } },
    } as ZuvixConfig;
    const applied = applyOpencodeZenModelDefault(cfg);
    expectConfigUnchanged(applied, cfg);
  });
});
