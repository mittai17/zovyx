// Openrouter tests cover provider runtime.contract plugin behavior.
import { describeOpenRouterProviderRuntimeContract } from "zuvix/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
