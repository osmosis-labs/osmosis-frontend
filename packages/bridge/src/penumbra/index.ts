import {
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  GetBridgeSupportedAssetsParams,
} from "../interface";

export class PenumbraBridgeProvider implements BridgeProvider {
  static readonly ID = "Penumbra";
  readonly providerName = PenumbraBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Penumbra quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    // just supports SOL via Penumbra

    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const penumbraCounterparty = assetListAsset.counterparty.find(
        (c) => c.chainName === "penumbra"
      );

      if (penumbraCounterparty) {
        return [
          {
            transferTypes: ["external-url"],
            chainId: "penumbra",
            chainName: "Penumbra",
            chainType: "penumbra",
            denom: penumbraCounterparty.symbol,
            address: penumbraCounterparty.sourceDenom,
            decimals: penumbraCounterparty.decimals,
          },
        ];
      }
    }

    return [];
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Penumbra transactions are currently not supported.");
  }

  async getExternalUrl(): Promise<BridgeExternalUrl | undefined> {
    throw new Error("Penumbra external urls are currently not supported.");
  }
}
