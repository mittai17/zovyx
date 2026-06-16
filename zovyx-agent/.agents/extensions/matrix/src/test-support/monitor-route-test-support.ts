// Matrix plugin module implements monitor route test support behavior.
export {
  registerSessionBindingAdapter,
  testing,
} from "zuvix/plugin-sdk/session-binding-runtime";
export { resolveAgentRoute } from "zuvix/plugin-sdk/routing";
export {
  createTestRegistry,
  setActivePluginRegistry,
} from "zuvix/plugin-sdk/plugin-test-runtime";
export type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
