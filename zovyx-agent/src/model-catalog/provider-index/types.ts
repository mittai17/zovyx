// Provider-index types describe install hints, auth choices, and preview catalogs for discoverable providers.
import type { ModelCatalogProvider } from "@zuvix/model-catalog-core/model-catalog-types";

// Normalized provider-index schema. It describes providers discoverable before
// plugin install, including install hints, auth choices, and preview catalogs.
export type ZuvixProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type ZuvixProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: ZuvixProviderIndexPluginInstall;
};

export type ZuvixProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation" | "music-generation")[];
};

export type ZuvixProviderIndexProvider = {
  id: string;
  name: string;
  plugin: ZuvixProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly ZuvixProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type ZuvixProviderIndex = {
  version: number;
  providers: Readonly<Record<string, ZuvixProviderIndexProvider>>;
};
