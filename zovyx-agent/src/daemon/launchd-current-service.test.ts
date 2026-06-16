// Launchd current service tests cover resolving active macOS service labels.
import { describe, expect, it } from "vitest";
import { isCurrentProcessLaunchdServiceLabel } from "./launchd-current-service.js";

describe("isCurrentProcessLaunchdServiceLabel", () => {
  it("matches launchd-provided service labels", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.zuvix.gateway", {
        LAUNCH_JOB_LABEL: "ai.zuvix.gateway",
      }),
    ).toBe(true);
  });

  it("falls back to Zuvix service markers when XPC_SERVICE_NAME is inherited", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.zuvix.gateway", {
        XPC_SERVICE_NAME: "0",
        ZUVIX_SERVICE_MARKER: "zuvix",
        ZUVIX_SERVICE_KIND: "gateway",
        ZUVIX_LAUNCHD_LABEL: "ai.zuvix.gateway",
      }),
    ).toBe(true);
  });

  it("preserves label-only fallback when launchd exposes no label variables", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.zuvix.gateway", {
        ZUVIX_LAUNCHD_LABEL: "ai.zuvix.gateway",
      }),
    ).toBe(true);
  });

  it("can require service markers for label-only fallback", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel(
        "ai.zuvix.gateway",
        {
          ZUVIX_LAUNCHD_LABEL: "ai.zuvix.gateway",
        },
        { allowConfiguredLabelFallback: false },
      ),
    ).toBe(false);
  });

  it("does not treat unrelated inherited launchd labels as current services", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.zuvix.gateway", {
        XPC_SERVICE_NAME: "0",
        ZUVIX_LAUNCHD_LABEL: "ai.zuvix.gateway",
      }),
    ).toBe(false);
  });
});
