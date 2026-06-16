// Builds plugin API objects from config, registries, and runtime helpers.
import type { ZuvixConfig } from "../config/types.zuvix.js";
import { attachPluginApiFacades, type ZuvixPluginApiWithoutFacades } from "./api-facades.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { ZuvixPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: ZuvixPluginApi["registrationMode"];
  config: ZuvixConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      ZuvixPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerHostedMediaResolver"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerReload"
      | "registerNodeHostCommand"
      | "registerNodeInvokePolicy"
      | "registerSecurityAuditCollector"
      | "registerService"
      | "registerGatewayDiscoveryService"
      | "registerCliBackend"
      | "registerTextTransforms"
      | "registerConfigMigration"
      | "registerMigrationProvider"
      | "registerAutoEnableProbe"
      | "registerProvider"
      | "registerModelCatalogProvider"
      | "registerEmbeddingProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerTranscriptSourceProvider"
      | "registerImageGenerationProvider"
      | "registerVideoGenerationProvider"
      | "registerMusicGenerationProvider"
      | "registerWebFetchProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerCompactionProvider"
      | "registerAgentHarness"
      | "registerCodexAppServerExtensionFactory"
      | "registerAgentToolResultMiddleware"
      | "registerSessionExtension"
      | "enqueueNextTurnInjection"
      | "registerTrustedToolPolicy"
      | "registerToolMetadata"
      | "registerControlUiDescriptor"
      | "registerRuntimeLifecycle"
      | "registerAgentEventSubscription"
      | "emitAgentEvent"
      | "setRunContext"
      | "getRunContext"
      | "clearRunContext"
      | "registerSessionSchedulerJob"
      | "registerSessionAction"
      | "sendSessionAttachment"
      | "scheduleSessionTurn"
      | "unscheduleSessionTurnsByTag"
      | "registerDetachedTaskRuntime"
      | "registerMemoryCapability"
      | "registerMemoryPromptSection"
      | "registerMemoryPromptSupplement"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: ZuvixPluginApi["registerTool"] = () => {};
const noopRegisterHook: ZuvixPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: ZuvixPluginApi["registerHttpRoute"] = () => {};
const noopRegisterHostedMediaResolver: ZuvixPluginApi["registerHostedMediaResolver"] = () => {};
const noopRegisterChannel: ZuvixPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: ZuvixPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: ZuvixPluginApi["registerCli"] = () => {};
const noopRegisterReload: ZuvixPluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: ZuvixPluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterNodeInvokePolicy: ZuvixPluginApi["registerNodeInvokePolicy"] = () => {};
const noopRegisterSecurityAuditCollector: ZuvixPluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: ZuvixPluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: ZuvixPluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: ZuvixPluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: ZuvixPluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: ZuvixPluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: ZuvixPluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: ZuvixPluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: ZuvixPluginApi["registerProvider"] = () => {};
const noopRegisterModelCatalogProvider: ZuvixPluginApi["registerModelCatalogProvider"] =
  () => {};
const noopRegisterEmbeddingProvider: ZuvixPluginApi["registerEmbeddingProvider"] = () => {};
const noopRegisterSpeechProvider: ZuvixPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: ZuvixPluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: ZuvixPluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: ZuvixPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterTranscriptsSourceProvider: ZuvixPluginApi["registerTranscriptSourceProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: ZuvixPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: ZuvixPluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: ZuvixPluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: ZuvixPluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: ZuvixPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: ZuvixPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: ZuvixPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: ZuvixPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: ZuvixPluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: ZuvixPluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: ZuvixPluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: ZuvixPluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: ZuvixPluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: ZuvixPluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: ZuvixPluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: ZuvixPluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: ZuvixPluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: ZuvixPluginApi["registerControlUiDescriptor"] = () => {};
const noopRegisterRuntimeLifecycle: ZuvixPluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: ZuvixPluginApi["registerAgentEventSubscription"] =
  () => {};
const noopEmitAgentEvent: ZuvixPluginApi["emitAgentEvent"] = () => ({
  emitted: false,
  reason: "not wired",
});
const noopSetRunContext: ZuvixPluginApi["setRunContext"] = () => false;
const noopGetRunContext: ZuvixPluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: ZuvixPluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: ZuvixPluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterSessionAction: ZuvixPluginApi["registerSessionAction"] = () => {};
const noopSendSessionAttachment: ZuvixPluginApi["sendSessionAttachment"] = async () => ({
  ok: false,
  error: "not wired",
});
const noopScheduleSessionTurn: ZuvixPluginApi["scheduleSessionTurn"] = async () => undefined;
const noopUnscheduleSessionTurnsByTag: ZuvixPluginApi["unscheduleSessionTurnsByTag"] =
  async () => ({ removed: 0, failed: 0 });
const noopRegisterDetachedTaskRuntime: ZuvixPluginApi["registerDetachedTaskRuntime"] = () => {};
const noopRegisterMemoryCapability: ZuvixPluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: ZuvixPluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryPromptSupplement: ZuvixPluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: ZuvixPluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: ZuvixPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: ZuvixPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: ZuvixPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: ZuvixPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): ZuvixPluginApi {
  const handlers = params.handlers ?? {};
  const registerCli = handlers.registerCli ?? noopRegisterCli;
  const api: ZuvixPluginApiWithoutFacades = {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerHostedMediaResolver:
      handlers.registerHostedMediaResolver ?? noopRegisterHostedMediaResolver,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli,
    registerNodeCliFeature: (registrar, opts) =>
      registerCli(registrar, {
        ...opts,
        parentPath: ["nodes"],
      }),
    registerReload: handlers.registerReload ?? noopRegisterReload,
    registerNodeHostCommand: handlers.registerNodeHostCommand ?? noopRegisterNodeHostCommand,
    registerNodeInvokePolicy: handlers.registerNodeInvokePolicy ?? noopRegisterNodeInvokePolicy,
    registerSecurityAuditCollector:
      handlers.registerSecurityAuditCollector ?? noopRegisterSecurityAuditCollector,
    registerService: handlers.registerService ?? noopRegisterService,
    registerGatewayDiscoveryService:
      handlers.registerGatewayDiscoveryService ?? noopRegisterGatewayDiscoveryService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerTextTransforms: handlers.registerTextTransforms ?? noopRegisterTextTransforms,
    registerConfigMigration: handlers.registerConfigMigration ?? noopRegisterConfigMigration,
    registerMigrationProvider: handlers.registerMigrationProvider ?? noopRegisterMigrationProvider,
    registerAutoEnableProbe: handlers.registerAutoEnableProbe ?? noopRegisterAutoEnableProbe,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerModelCatalogProvider:
      handlers.registerModelCatalogProvider ?? noopRegisterModelCatalogProvider,
    registerEmbeddingProvider: handlers.registerEmbeddingProvider ?? noopRegisterEmbeddingProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerRealtimeTranscriptionProvider:
      handlers.registerRealtimeTranscriptionProvider ?? noopRegisterRealtimeTranscriptionProvider,
    registerRealtimeVoiceProvider:
      handlers.registerRealtimeVoiceProvider ?? noopRegisterRealtimeVoiceProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerTranscriptSourceProvider:
      handlers.registerTranscriptSourceProvider ?? noopRegisterTranscriptsSourceProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerVideoGenerationProvider:
      handlers.registerVideoGenerationProvider ?? noopRegisterVideoGenerationProvider,
    registerMusicGenerationProvider:
      handlers.registerMusicGenerationProvider ?? noopRegisterMusicGenerationProvider,
    registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerCompactionProvider:
      handlers.registerCompactionProvider ?? noopRegisterCompactionProvider,
    registerAgentHarness: handlers.registerAgentHarness ?? noopRegisterAgentHarness,
    registerCodexAppServerExtensionFactory:
      handlers.registerCodexAppServerExtensionFactory ?? noopRegisterCodexAppServerExtensionFactory,
    registerAgentToolResultMiddleware:
      handlers.registerAgentToolResultMiddleware ?? noopRegisterAgentToolResultMiddleware,
    registerSessionExtension: handlers.registerSessionExtension ?? noopRegisterSessionExtension,
    enqueueNextTurnInjection: handlers.enqueueNextTurnInjection ?? noopEnqueueNextTurnInjection,
    registerTrustedToolPolicy: handlers.registerTrustedToolPolicy ?? noopRegisterTrustedToolPolicy,
    registerToolMetadata: handlers.registerToolMetadata ?? noopRegisterToolMetadata,
    registerControlUiDescriptor:
      handlers.registerControlUiDescriptor ?? noopRegisterControlUiDescriptor,
    registerRuntimeLifecycle: handlers.registerRuntimeLifecycle ?? noopRegisterRuntimeLifecycle,
    registerAgentEventSubscription:
      handlers.registerAgentEventSubscription ?? noopRegisterAgentEventSubscription,
    emitAgentEvent: handlers.emitAgentEvent ?? noopEmitAgentEvent,
    setRunContext: handlers.setRunContext ?? noopSetRunContext,
    getRunContext: handlers.getRunContext ?? noopGetRunContext,
    clearRunContext: handlers.clearRunContext ?? noopClearRunContext,
    registerSessionSchedulerJob:
      handlers.registerSessionSchedulerJob ?? noopRegisterSessionSchedulerJob,
    registerSessionAction: handlers.registerSessionAction ?? noopRegisterSessionAction,
    sendSessionAttachment: handlers.sendSessionAttachment ?? noopSendSessionAttachment,
    scheduleSessionTurn: handlers.scheduleSessionTurn ?? noopScheduleSessionTurn,
    unscheduleSessionTurnsByTag:
      handlers.unscheduleSessionTurnsByTag ?? noopUnscheduleSessionTurnsByTag,
    registerDetachedTaskRuntime:
      handlers.registerDetachedTaskRuntime ?? noopRegisterDetachedTaskRuntime,
    registerMemoryCapability: handlers.registerMemoryCapability ?? noopRegisterMemoryCapability,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryPromptSupplement:
      handlers.registerMemoryPromptSupplement ?? noopRegisterMemoryPromptSupplement,
    registerMemoryCorpusSupplement:
      handlers.registerMemoryCorpusSupplement ?? noopRegisterMemoryCorpusSupplement,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
  return attachPluginApiFacades(api);
}
