import { AxelarBridgeProvider } from "./axelar";
import { IbcBridgeProvider } from "./ibc";
import { BridgeProviderContext } from "./interface";
import { NitroBridgeProvider } from "./nitro";
import { NomicBridgeProvider } from "./nomic";
import { SkipBridgeProvider } from "./skip";
import { SquidBridgeProvider } from "./squid";
import { WormholeBridgeProvider } from "./wormhole";

export type Bridge = keyof BridgeProviders["bridges"];

/** Instance of all available bridge providers. */
export class BridgeProviders {
  public readonly bridges: {
    [SquidBridgeProvider.ID]: SquidBridgeProvider;
    [AxelarBridgeProvider.ID]: AxelarBridgeProvider;
    [SkipBridgeProvider.ID]: SkipBridgeProvider;
    [IbcBridgeProvider.ID]: IbcBridgeProvider;
    [NomicBridgeProvider.ID]: NomicBridgeProvider;
    [WormholeBridgeProvider.ID]: WormholeBridgeProvider;
    [NitroBridgeProvider.ID]: NitroBridgeProvider;
  };

  constructor(integratorId: string, commonContext: BridgeProviderContext) {
    if (!integratorId) {
      throw new Error("Integrator ID is required");
    }

    this.bridges = {
      [SquidBridgeProvider.ID]: new SquidBridgeProvider(
        integratorId,
        commonContext
      ),
      [AxelarBridgeProvider.ID]: new AxelarBridgeProvider(commonContext),
      [SkipBridgeProvider.ID]: new SkipBridgeProvider(commonContext),
      [IbcBridgeProvider.ID]: new IbcBridgeProvider(commonContext),
      [NomicBridgeProvider.ID]: new NomicBridgeProvider(commonContext),
      [WormholeBridgeProvider.ID]: new WormholeBridgeProvider(commonContext),
      [NitroBridgeProvider.ID]: new NitroBridgeProvider(commonContext),
    };
  }
}
