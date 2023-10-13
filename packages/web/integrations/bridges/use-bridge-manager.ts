import { BridgeManager } from "~/integrations/bridges/bridge-manager";

const bridgeManager = new BridgeManager(
  process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID ?? ""
);

export const useBridgeManager = () => {
  return { bridgeManager };
};
