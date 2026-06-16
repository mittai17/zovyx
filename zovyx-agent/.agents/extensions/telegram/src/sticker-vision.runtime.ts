// Telegram plugin module implements sticker vision behavior.
import {
  findModelInCatalog,
  loadModelCatalog,
  modelSupportsVision,
  resolveDefaultModelForAgent,
} from "zuvix/plugin-sdk/agent-runtime";
import type { ZuvixConfig } from "zuvix/plugin-sdk/config-contracts";

export async function resolveStickerVisionSupportRuntime(params: {
  cfg: ZuvixConfig;
  agentId?: string;
}): Promise<boolean> {
  const catalog = await loadModelCatalog({ config: params.cfg });
  const defaultModel = resolveDefaultModelForAgent({
    cfg: params.cfg,
    agentId: params.agentId,
  });
  const entry = findModelInCatalog(catalog, defaultModel.provider, defaultModel.model);
  if (!entry) {
    return false;
  }
  return modelSupportsVision(entry);
}
