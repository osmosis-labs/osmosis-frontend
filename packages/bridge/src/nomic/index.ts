import {
  BridgeAsset,
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";

export class NomicBridgeProvider implements BridgeProvider {
  static readonly ID = "Nomic";
  readonly providerName = NomicBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Nomic quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    // just supports BTC from Bitcoin

    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const bitcoinCounterparty = assetListAsset.counterparty.some(
        (c) => c.chainName === "bitcoin"
      );

      if (bitcoinCounterparty) {
        return [
          {
            chainId: "bitcoin",
            chainName: "Bitcoin",
            chainType: "bitcoin",
            denom: "BTC",
            address: "sat",
            decimals: 8,
          },
        ];
      }
    }

    return [];
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Nomic transactions are currently not supported.");
  }

  async getExternalUrl({
    fromChain,
    toChain,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const url = new URL("https://app.nomic.io/bitcoin");

    if (fromChain.chainType === "bitcoin") {
      url.searchParams.set("deposit", "confirmation");
    } else if (toChain.chainType === "bitcoin") {
      url.searchParams.set("withdraw", "address");
    }

    return {
      urlProviderName: "Nomic",
      url,
    };
  }
}
