import { AxelarBridgeProvider } from "./axelar";
import { BridgeProviderContext } from "./interface";
import { SkipBridgeProvider } from "./skip";
import { SquidBridgeProvider } from "./squid";

export type Bridge = keyof BridgeProviders["bridges"];

/** Instance of all available bridge providers. */
export class BridgeProviders {
  public readonly bridges: {
    [SquidBridgeProvider.providerName]: SquidBridgeProvider;
    [AxelarBridgeProvider.providerName]: AxelarBridgeProvider;
    [SkipBridgeProvider.providerName]: SkipBridgeProvider;
  };

  constructor(integratorId: string, commonContext: BridgeProviderContext) {
    if (!integratorId) {
      throw new Error("Integrator ID is required");
    }

    this.bridges = {
      [SquidBridgeProvider.providerName]: new SquidBridgeProvider(
        integratorId,
        commonContext
      ),
      [AxelarBridgeProvider.providerName]: new AxelarBridgeProvider(
        commonContext
      ),
      [SkipBridgeProvider.providerName]: new SkipBridgeProvider(commonContext),
    };
  }
}

export * from "./axelar";
export * from "./chain";
export * from "./errors";
export * from "./interface";
export * from "./skip";
export * from "./squid";
