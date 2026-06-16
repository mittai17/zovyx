// Matrix plugin module implements device health behavior.
export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleZuvixDevices: MatrixManagedDeviceInfo[];
  currentZuvixDevices: MatrixManagedDeviceInfo[];
};

const ZUVIX_DEVICE_NAME_PREFIX = "Zuvix ";

export function isZuvixManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(ZUVIX_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const zuvixDevices = devices.filter((device) =>
    isZuvixManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleZuvixDevices: zuvixDevices.filter((device) => !device.current),
    currentZuvixDevices: zuvixDevices.filter((device) => device.current),
  };
}
