// Matrix plugin module implements exec approval resolver behavior.
import { resolveApprovalOverGateway } from "zuvix/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "zuvix/plugin-sdk/approval-runtime";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "zuvix/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: ZuvixConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
