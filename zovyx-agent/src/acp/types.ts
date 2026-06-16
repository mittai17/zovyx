/** ACP server option re-exports and Zuvix agent identity metadata. */
export type { AcpProvenanceMode, AcpServerOptions, AcpSession } from "@zuvix/acp-core/types";
export { normalizeAcpProvenanceMode } from "@zuvix/acp-core/types";
import { VERSION } from "../version.js";

/** ACP agent identity advertised during protocol initialization. */
export const ACP_AGENT_INFO = {
  name: "zuvix-acp",
  title: "Zuvix ACP Gateway",
  version: VERSION,
};
