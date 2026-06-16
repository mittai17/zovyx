// Shared harness for spawn command tests and mocked agent process state.
import type { ZuvixConfig } from "../../config/types.zuvix.js";
import type { MsgContext } from "../templating.js";
import { buildCommandTestParams as buildBaseCommandTestParams } from "./commands.test-harness.js";

export function buildCommandTestParams(
  commandBody: string,
  cfg: ZuvixConfig,
  ctxOverrides?: Partial<MsgContext>,
) {
  return buildBaseCommandTestParams(commandBody, cfg, ctxOverrides);
}
