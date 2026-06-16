// Install download test utilities provide isolated state and workspace paths.
import {
  createZuvixTestState,
  type ZuvixTestState,
} from "../../test-utils/zuvix-test-state.js";

/** Creates isolated Zuvix state for install download tests. */
export async function createInstallDownloadTestState(): Promise<ZuvixTestState> {
  return await createZuvixTestState({
    layout: "state-only",
    prefix: "zuvix-skills-install-",
  });
}
