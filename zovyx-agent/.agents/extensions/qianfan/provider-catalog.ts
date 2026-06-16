// Qianfan provider module implements model/runtime integration.
import { buildManifestModelProviderConfig } from "zuvix/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "zuvix/plugin-sdk/provider-model-shared";
import manifest from "./zuvix.plugin.json" with { type: "json" };

export const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
export const QIANFAN_DEFAULT_MODEL_ID = "deepseek-v3.2";

export function buildQianfanProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "qianfan",
    catalog: manifest.modelCatalog.providers.qianfan,
  });
}
