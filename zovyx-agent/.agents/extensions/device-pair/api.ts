// Device Pair API module exposes the plugin public contract.
export {
  approveDevicePairing,
  clearDeviceBootstrapTokens,
  issueDeviceBootstrapToken,
  PAIRING_SETUP_BOOTSTRAP_PROFILE,
  listDevicePairing,
  revokeDeviceBootstrapToken,
  type DeviceBootstrapProfile,
} from "zuvix/plugin-sdk/device-bootstrap";
export { definePluginEntry, type ZuvixPluginApi } from "zuvix/plugin-sdk/plugin-entry";
export {
  resolveGatewayBindUrl,
  resolveGatewayPort,
  resolveTailnetHostWithRunner,
} from "zuvix/plugin-sdk/core";
export {
  resolvePreferredZuvixTmpDir,
  runPluginCommandWithTimeout,
} from "zuvix/plugin-sdk/sandbox";
export { renderQrPngBase64, renderQrPngDataUrl, writeQrPngTempFile } from "./qr-image.js";
