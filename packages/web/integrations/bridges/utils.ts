import { SquidBridgeProvider } from "~/integrations/bridges/squid";

export const BridgeIdToBridgeProvider = {
  [SquidBridgeProvider.providerName]: SquidBridgeProvider,
};
