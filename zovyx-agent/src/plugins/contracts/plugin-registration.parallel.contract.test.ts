import { pluginRegistrationContractCases } from "zuvix/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "zuvix/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract(pluginRegistrationContractCases.parallel);
