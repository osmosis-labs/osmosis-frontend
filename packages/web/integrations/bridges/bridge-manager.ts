import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "~/config/env";
import { AxelarBridgeProvider } from "~/integrations/bridges/axelar/axelar-bridge-provider";
import { SquidBridgeProvider } from "~/integrations/bridges/squid";
import { BridgeProviderContext } from "~/integrations/bridges/types";

export type AvailableBridges = keyof BridgeManager["bridges"];

export class BridgeManager {
  public readonly bridges: {
    [SquidBridgeProvider.providerName]: SquidBridgeProvider;
    [AxelarBridgeProvider.providerName]: AxelarBridgeProvider;
  };

  constructor(
    integratorId: string,
    env: "mainnet" | "testnet" = IS_TESTNET ? "testnet" : "mainnet",
    cache = new LRUCache<string, CacheEntry>({ max: 500 })
  ) {
    if (!integratorId) {
      throw new Error("Integrator ID is required");
    }

    const context: BridgeProviderContext = {
      env,
      cache,
    };

    this.bridges = {
      [SquidBridgeProvider.providerName]: new SquidBridgeProvider(
        integratorId,
        context
      ),
      [AxelarBridgeProvider.providerName]: new AxelarBridgeProvider(context),
    };
  }
}
