// Matrix tests cover device health plugin behavior.
import { describe, expect, it } from "vitest";
import { isZuvixManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects Zuvix-managed device names", () => {
    expect(isZuvixManagedMatrixDevice("Zuvix Gateway")).toBe(true);
    expect(isZuvixManagedMatrixDevice("Zuvix Debug")).toBe(true);
    expect(isZuvixManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isZuvixManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale Zuvix-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "Zuvix Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "Zuvix Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "Zuvix Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentZuvixDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "Zuvix Gateway",
          current: true,
        },
      ],
      staleZuvixDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "Zuvix Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "Zuvix Debug",
          current: false,
        },
      ],
    });
  });
});
