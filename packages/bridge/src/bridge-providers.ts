import { AxelarBridgeProvider } from "./axelar";
import { IbcBridgeProvider } from "./ibc";
import { BridgeProviderContext } from "./interface";
import { SkipBridgeProvider } from "./skip";
import { SquidBridgeProvider } from "./squid";

export type Bridge = keyof BridgeProviders["bridges"];

/** Instance of all available bridge providers. */
export class BridgeProviders {
  public readonly bridges: {
    [SquidBridgeProvider.ID]: SquidBridgeProvider;
    [AxelarBridgeProvider.ID]: AxelarBridgeProvider;
    [SkipBridgeProvider.ID]: SkipBridgeProvider;
    [IbcBridgeProvider.ID]: IbcBridgeProvider;
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
    };
  }
}
