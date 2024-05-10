import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "~/config/env";

import { AxelarBridgeProvider } from "./axelar";
import { BridgeProviderContext } from "./interface";
import { SkipBridgeProvider } from "./skip";
import { SquidBridgeProvider } from "./squid";

export type Bridge = keyof BridgeManager["bridges"];

export class BridgeManager {
  public readonly bridges: {
    [SquidBridgeProvider.providerName]: SquidBridgeProvider;
    [AxelarBridgeProvider.providerName]: AxelarBridgeProvider;
    [SkipBridgeProvider.providerName]: SkipBridgeProvider;
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
      [SkipBridgeProvider.providerName]: new SkipBridgeProvider(context),
    };
  }
}

export * from "./axelar";
export * from "./errors";
export * from "./interface";
export * from "./skip";
export * from "./squid";
