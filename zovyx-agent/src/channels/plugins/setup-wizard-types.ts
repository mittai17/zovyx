/**
 * Declarative channel setup wizard contract.
 *
 * Defines status, credentials, prompts, group access, and finalization types for setup flows.
 */
import type { DmPolicy } from "../../config/types.js";
import type { ZuvixConfig } from "../../config/types.zuvix.js";
import type { RuntimeEnv } from "../../runtime.js";
import type { WizardPrompter } from "../../wizard/prompts.js";
import type { ChannelAccessPolicy } from "./setup-group-access.js";
import type { ChannelConfigAdapter, ChannelSetupAdapter } from "./types.adapters.js";
import type {
  ChannelCapabilities,
  ChannelId,
  ChannelMeta,
  ChannelSetupInput,
} from "./types.core.js";

export type ChannelSetupPlugin = {
  id: ChannelId;
  meta: ChannelMeta;
  capabilities: ChannelCapabilities;
  config: ChannelConfigAdapter<unknown>;
  setup?: ChannelSetupAdapter;
  setupWizard?: ChannelSetupWizard | ChannelSetupWizardAdapter;
};

/** Status block shown before users select channels during setup. */
export type ChannelSetupWizardStatus = {
  configuredLabel: string;
  unconfiguredLabel: string;
  configuredHint?: string;
  unconfiguredHint?: string;
  configuredScore?: number;
  unconfiguredScore?: number;
  resolveConfigured: (params: {
    cfg: ZuvixConfig;
    accountId?: string;
  }) => boolean | Promise<boolean>;
  resolveStatusLines?: (params: {
    cfg: ZuvixConfig;
    accountId?: string;
    configured: boolean;
  }) => string[] | Promise<string[]>;
  resolveSelectionHint?: (params: {
    cfg: ZuvixConfig;
    accountId?: string;
    configured: boolean;
  }) => string | undefined | Promise<string | undefined>;
  resolveQuickstartScore?: (params: {
    cfg: ZuvixConfig;
    accountId?: string;
    configured: boolean;
  }) => number | undefined | Promise<number | undefined>;
};

/** Snapshot of one credential before prompting or reusing existing config. */
export type ChannelSetupWizardCredentialState = {
  accountConfigured: boolean;
  hasConfiguredValue: boolean;
  resolvedValue?: string;
  envValue?: string;
};

export type ChannelSetupWizardCredentialValues = Partial<Record<string, string>>;

/** Optional explanatory note shown when its owning step is reached. */
export type ChannelSetupWizardNote = {
  title: string;
  lines: string[];
  shouldShow?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => boolean | Promise<boolean>;
};

/** Lets a wizard configure an account entirely from existing environment. */
export type ChannelSetupWizardEnvShortcut = {
  prompt: string;
  preferredEnvVar?: string;
  isAvailable: (params: { cfg: ZuvixConfig; accountId: string }) => boolean;
  apply: (params: {
    cfg: ZuvixConfig;
    accountId: string;
  }) => ZuvixConfig | Promise<ZuvixConfig>;
};

/** Declarative secret/input step for a channel account credential. */
export type ChannelSetupWizardCredential = {
  inputKey: keyof ChannelSetupInput;
  providerHint: string;
  credentialLabel: string;
  preferredEnvVar?: string;
  helpTitle?: string;
  helpLines?: string[];
  envPrompt: string;
  keepPrompt: string;
  inputPrompt: string;
  allowEnv?: (params: { cfg: ZuvixConfig; accountId: string }) => boolean;
  inspect: (params: {
    cfg: ZuvixConfig;
    accountId: string;
  }) => ChannelSetupWizardCredentialState;
  shouldPrompt?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    currentValue?: string;
    state: ChannelSetupWizardCredentialState;
  }) => boolean | Promise<boolean>;
  applyUseEnv?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
  }) => ZuvixConfig | Promise<ZuvixConfig>;
  applySet?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    value: unknown;
    resolvedValue: string;
  }) => ZuvixConfig | Promise<ZuvixConfig>;
};

/** Declarative non-secret text step that can depend on resolved credentials. */
export type ChannelSetupWizardTextInput = {
  inputKey: keyof ChannelSetupInput;
  message: string;
  placeholder?: string;
  required?: boolean;
  applyEmptyValue?: boolean;
  helpTitle?: string;
  helpLines?: string[];
  confirmCurrentValue?: boolean;
  keepPrompt?: string | ((value: string) => string);
  currentValue?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined | Promise<string | undefined>;
  initialValue?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined | Promise<string | undefined>;
  shouldPrompt?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    currentValue?: string;
  }) => boolean | Promise<boolean>;
  applyCurrentValue?: boolean;
  validate?: (params: {
    value: string;
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined;
  normalizeValue?: (params: {
    value: string;
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string;
  applySet?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    value: string;
  }) => ZuvixConfig | Promise<ZuvixConfig>;
};

export type ChannelSetupWizardAllowFromEntry = {
  input: string;
  resolved: boolean;
  id: string | null;
};

/** Channel-specific resolver for user-entered allowlist targets. */
export type ChannelSetupWizardAllowFrom = {
  helpTitle?: string;
  helpLines?: string[];
  credentialInputKey?: keyof ChannelSetupInput;
  message: string;
  placeholder: string;
  invalidWithoutCredentialNote: string;
  parseInputs?: (raw: string) => string[];
  parseId: (raw: string) => string | null;
  resolveEntries: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    entries: string[];
  }) => Promise<ChannelSetupWizardAllowFromEntry[]>;
  apply: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    allowFrom: string[];
  }) => ZuvixConfig | Promise<ZuvixConfig>;
};

/** Declarative group/DM access policy step used by interactive setup. */
export type ChannelSetupWizardGroupAccess = {
  label: string;
  placeholder: string;
  helpTitle?: string;
  helpLines?: string[];
  skipAllowlistEntries?: boolean;
  currentPolicy: (params: { cfg: ZuvixConfig; accountId: string }) => ChannelAccessPolicy;
  currentEntries: (params: { cfg: ZuvixConfig; accountId: string }) => string[];
  updatePrompt: (params: { cfg: ZuvixConfig; accountId: string }) => boolean;
  setPolicy: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    policy: ChannelAccessPolicy;
  }) => ZuvixConfig;
  resolveAllowlist?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    entries: string[];
    prompter: Pick<WizardPrompter, "note">;
  }) => Promise<unknown>;
  applyAllowlist?: (params: {
    cfg: ZuvixConfig;
    accountId: string;
    resolved: unknown;
  }) => ZuvixConfig;
};

/** Optional pre-step hook for deriving helper config or credential values. */
export type ChannelSetupWizardPrepare = (params: {
  cfg: ZuvixConfig;
  accountId: string;
  credentialValues: ChannelSetupWizardCredentialValues;
  runtime: ChannelSetupConfigureContext["runtime"];
  prompter: WizardPrompter;
  options?: ChannelSetupConfigureContext["options"];
}) =>
  | {
      cfg?: ZuvixConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    }
  | void
  | Promise<{
      cfg?: ZuvixConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    } | void>;

/** Optional post-step hook for final validation, writes, or post prompts. */
export type ChannelSetupWizardFinalize = (params: {
  cfg: ZuvixConfig;
  accountId: string;
  credentialValues: ChannelSetupWizardCredentialValues;
  runtime: ChannelSetupConfigureContext["runtime"];
  prompter: WizardPrompter;
  options?: ChannelSetupConfigureContext["options"];
  forceAllowFrom: boolean;
}) =>
  | {
      cfg?: ZuvixConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    }
  | void
  | Promise<{
      cfg?: ZuvixConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    } | void>;

/** Full declarative setup wizard consumed by the generic setup adapter. */
export type ChannelSetupWizard = {
  channel: string;
  status: ChannelSetupWizardStatus;
  introNote?: ChannelSetupWizardNote;
  envShortcut?: ChannelSetupWizardEnvShortcut;
  resolveAccountIdForConfigure?: (params: {
    cfg: ZuvixConfig;
    prompter: WizardPrompter;
    options?: ChannelSetupConfigureContext["options"];
    accountOverride?: string;
    shouldPromptAccountIds: boolean;
    listAccountIds: ChannelSetupPlugin["config"]["listAccountIds"];
    defaultAccountId: string;
  }) => string | Promise<string>;
  resolveShouldPromptAccountIds?: (params: {
    cfg: ZuvixConfig;
    options?: ChannelSetupConfigureContext["options"];
    shouldPromptAccountIds: boolean;
  }) => boolean;
  prepare?: ChannelSetupWizardPrepare;
  stepOrder?: "credentials-first" | "text-first";
  credentials: ChannelSetupWizardCredential[];
  textInputs?: ChannelSetupWizardTextInput[];
  finalize?: ChannelSetupWizardFinalize;
  completionNote?: ChannelSetupWizardNote;
  dmPolicy?: ChannelSetupDmPolicy;
  allowFrom?: ChannelSetupWizardAllowFrom;
  groupAccess?: ChannelSetupWizardGroupAccess;
  disable?: (cfg: ZuvixConfig) => ZuvixConfig;
  onAccountRecorded?: ChannelSetupWizardAdapter["onAccountRecorded"];
};

/** Runtime options for selecting and configuring one or more channels. */
export type SetupChannelsOptions = {
  allowDisable?: boolean;
  allowSignalInstall?: boolean;
  onSelection?: (selection: ChannelId[]) => void;
  onPostWriteHook?: (hook: ChannelOnboardingPostWriteHook) => void;
  accountIds?: Partial<Record<ChannelId, string>>;
  onAccountId?: (channel: ChannelId, accountId: string) => void;
  onResolvedPlugin?: (channel: ChannelId, plugin: ChannelSetupPlugin) => void;
  promptAccountIds?: boolean;
  forceAllowFromChannels?: ChannelId[];
  deferStatusUntilSelection?: boolean;
  skipStatusNote?: boolean;
  skipDmPolicyPrompt?: boolean;
  skipConfirm?: boolean;
  quickstartDefaults?: boolean;
  initialSelection?: ChannelId[];
  secretInputMode?: "plaintext" | "ref";
};

export type PromptAccountIdParams = {
  cfg: ZuvixConfig;
  prompter: WizardPrompter;
  label: string;
  currentId?: string;
  listAccountIds: (cfg: ZuvixConfig) => string[];
  defaultAccountId: string;
};

export type PromptAccountId = (params: PromptAccountIdParams) => Promise<string>;

export type ChannelSetupStatus = {
  channel: ChannelId;
  configured: boolean;
  statusLines: string[];
  selectionHint?: string;
  quickstartScore?: number;
};

/** Shared context for status checks before channel selection. */
export type ChannelSetupStatusContext = {
  cfg: ZuvixConfig;
  options?: SetupChannelsOptions;
  accountOverrides: Partial<Record<ChannelId, string>>;
};

/** Shared context for applying setup changes for a selected channel. */
export type ChannelSetupConfigureContext = {
  cfg: ZuvixConfig;
  runtime: RuntimeEnv;
  prompter: WizardPrompter;
  options?: SetupChannelsOptions;
  accountOverrides: Partial<Record<ChannelId, string>>;
  shouldPromptAccountIds: boolean;
  forceAllowFrom: boolean;
};

/** Context passed after setup has written config to disk. */
export type ChannelOnboardingPostWriteContext = {
  previousCfg: ZuvixConfig;
  cfg: ZuvixConfig;
  accountId: string;
  runtime: RuntimeEnv;
};

/** Deferred hook for channel work that must run after config persistence. */
export type ChannelOnboardingPostWriteHook = {
  channel: ChannelId;
  accountId: string;
  run: (ctx: { cfg: ZuvixConfig; runtime: RuntimeEnv }) => Promise<void> | void;
};

export type ChannelSetupResult = {
  cfg: ZuvixConfig;
  accountId?: string;
};

export type ChannelSetupConfiguredResult = ChannelSetupResult | "skip";

export type ChannelSetupInteractiveContext = ChannelSetupConfigureContext & {
  configured: boolean;
  label: string;
};

/** Optional direct-message policy contract exposed by setup adapters. */
export type ChannelSetupDmPolicy = {
  label: string;
  channel: ChannelId;
  policyKey: string;
  allowFromKey: string;
  resolveConfigKeys?: (
    cfg: ZuvixConfig,
    accountId?: string,
  ) => { policyKey: string; allowFromKey: string };
  getCurrent: (cfg: ZuvixConfig, accountId?: string) => DmPolicy;
  setPolicy: (cfg: ZuvixConfig, policy: DmPolicy, accountId?: string) => ZuvixConfig;
  promptAllowFrom?: (params: {
    cfg: ZuvixConfig;
    prompter: WizardPrompter;
    accountId?: string;
  }) => Promise<ZuvixConfig>;
};

/** Imperative adapter consumed by onboarding and setup flows. */
export type ChannelSetupWizardAdapter = {
  channel: ChannelId;
  getStatus: (ctx: ChannelSetupStatusContext) => Promise<ChannelSetupStatus>;
  configure: (ctx: ChannelSetupConfigureContext) => Promise<ChannelSetupResult>;
  configureInteractive?: (
    ctx: ChannelSetupInteractiveContext,
  ) => Promise<ChannelSetupConfiguredResult>;
  configureWhenConfigured?: (
    ctx: ChannelSetupInteractiveContext,
  ) => Promise<ChannelSetupConfiguredResult>;
  afterConfigWritten?: (ctx: ChannelOnboardingPostWriteContext) => Promise<void> | void;
  dmPolicy?: ChannelSetupDmPolicy;
  onAccountRecorded?: (accountId: string, options?: SetupChannelsOptions) => void;
  disable?: (cfg: ZuvixConfig) => ZuvixConfig;
};
