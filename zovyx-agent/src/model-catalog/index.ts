// Public model-catalog facade. Keep exports here curated so callers use the
// normalized planning APIs instead of reaching into provider-index internals.
export { mergeModelCatalogRowsByAuthority } from "./authority.js";
export { loadZuvixProviderIndex } from "./provider-index/index.js";
export {
  planManifestModelCatalogRows,
  planManifestModelCatalogSuppressions,
} from "./manifest-planner.js";
export { planProviderIndexModelCatalogRows } from "./provider-index-planner.js";
export type { ManifestModelCatalogSuppressionEntry } from "./manifest-planner.js";
export type {
  ModelCatalog,
  ModelCatalogAlias,
  ModelCatalogCost,
  ModelCatalogDiscovery,
  ModelCatalogInput,
  ModelCatalogModel,
  ModelCatalogProvider,
  ModelCatalogSource,
  ModelCatalogStatus,
  ModelCatalogSuppression,
  ModelCatalogTieredCost,
  NormalizedModelCatalogRow,
  UnifiedModelCatalogEntry,
  UnifiedModelCatalogKind,
  UnifiedModelCatalogSource,
} from "@zuvix/model-catalog-core/model-catalog-types";
export type { ZuvixProviderIndexProvider } from "./provider-index/index.js";
