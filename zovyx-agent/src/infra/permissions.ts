// Exposes cross-platform permission inspection helpers with fs-safe defaults.
import "./fs-safe-defaults.js";

// Permission inspection facades expose fs-safe POSIX and Windows ACL helpers
// after applying Zuvix's fs-safe defaults.
export {
  formatPermissionDetail,
  formatPermissionRemediation,
  inspectPathPermissions,
  safeStat,
  type PermissionCheck,
  type PermissionCheckOptions,
} from "@zuvix/fs-safe/permissions";
export {
  createIcaclsResetCommand,
  formatIcaclsResetCommand,
  formatWindowsAclSummary,
  inspectWindowsAcl,
  parseIcaclsOutput,
  resolveWindowsUserPrincipal,
  summarizeWindowsAcl,
  type PermissionExec as ExecFn,
  type WindowsAclEntry,
  type WindowsAclSummary,
} from "@zuvix/fs-safe/advanced";
