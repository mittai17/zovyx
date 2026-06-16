/**
 * Browser test-support re-exports from shared plugin-sdk test fixtures.
 */
export {
  createCliRuntimeCapture,
  expectGeneratedTokenPersistedToGatewayAuth,
  type CliMockOutputRuntime,
  type CliRuntimeCapture,
} from "zuvix/plugin-sdk/test-fixtures";
export {
  createTempHomeEnv,
  withEnv,
  withEnvAsync,
  withFetchPreconnect,
  isLiveTestEnabled,
} from "zuvix/plugin-sdk/test-env";
export type { FetchMock, TempHomeEnv } from "zuvix/plugin-sdk/test-env";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
