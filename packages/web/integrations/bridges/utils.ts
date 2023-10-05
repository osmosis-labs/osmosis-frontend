import { AxelarBridgeProvider } from "~/integrations/bridges/axelar/axelar-bridge-provider";
import { SquidBridgeProvider } from "~/integrations/bridges/squid";

export const BridgeIdToBridgeProvider = {
  [SquidBridgeProvider.providerName]: SquidBridgeProvider,
  [AxelarBridgeProvider.providerName]: AxelarBridgeProvider,
};
