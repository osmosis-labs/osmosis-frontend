import { IbcBridgeProvider } from "./ibc";
import { BridgeProviderContext } from "./interface";
import { PenumbraBridgeProvider } from "./penumbra";
import { SkipBridgeProvider } from "./skip";
import { SquidBridgeProvider } from "./squid";
import { WormholeBridgeProvider } from "./wormhole";

export type Bridge = keyof BridgeProviders["bridges"];

/** Instance of all available bridge providers. */
export class BridgeProviders {
  public readonly bridges: {
    [SquidBridgeProvider.ID]: SquidBridgeProvider;
    [SkipBridgeProvider.ID]: SkipBridgeProvider;
    [IbcBridgeProvider.ID]: IbcBridgeProvider;
    [WormholeBridgeProvider.ID]: WormholeBridgeProvider;
    [PenumbraBridgeProvider.ID]: PenumbraBridgeProvider;
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
      [SkipBridgeProvider.ID]: new SkipBridgeProvider(commonContext),
      [IbcBridgeProvider.ID]: new IbcBridgeProvider(commonContext),
      [WormholeBridgeProvider.ID]: new WormholeBridgeProvider(commonContext),
      [PenumbraBridgeProvider.ID]: new PenumbraBridgeProvider(commonContext),
    };
  }
}
