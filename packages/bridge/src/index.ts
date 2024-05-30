import { AxelarBridgeProvider, axelarProviderId } from "./axelar";
import { BridgeProviderContext } from "./interface";
import { SkipBridgeProvider, skipProviderId } from "./skip";
import { SquidBridgeProvider, squidProviderId } from "./squid";

export type Bridge = keyof BridgeProviders["bridges"];

/** Instance of all available bridge providers. */
export class BridgeProviders {
  public readonly bridges: {
    [squidProviderId]: SquidBridgeProvider;
    [axelarProviderId]: AxelarBridgeProvider;
    [skipProviderId]: SkipBridgeProvider;
  };

  constructor(integratorId: string, commonContext: BridgeProviderContext) {
    if (!integratorId) {
      throw new Error("Integrator ID is required");
    }

    this.bridges = {
      [squidProviderId]: new SquidBridgeProvider(integratorId, commonContext),
      [axelarProviderId]: new AxelarBridgeProvider(commonContext),
      [skipProviderId]: new SkipBridgeProvider(commonContext),
    };
  }
}

export * from "./axelar";
export * from "./chain";
export * from "./errors";
export * from "./interface";
export * from "./skip";
export * from "./squid";
