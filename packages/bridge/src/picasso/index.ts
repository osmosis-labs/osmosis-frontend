import {
  BridgeChain,
  BridgeExternalUrl,
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeSupportedAsset,
  BridgeTransactionRequest,
  GetBridgeExternalUrlParams,
  GetBridgeSupportedAssetsParams,
} from "../interface";

export class PicassoBridgeProvider implements BridgeProvider {
  static readonly ID = "Picasso";
  readonly providerName = PicassoBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Picasso quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    // just supports SOL via Picasso

    const assetListAsset = this.ctx.assetLists
      .flatMap(({ assets }) => assets)
      .find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

    if (assetListAsset) {
      const solanaCounterparty = assetListAsset.counterparty.find(
        (c) => c.chainName === "solana"
      );

      if (solanaCounterparty) {
        return [
          {
            transferTypes: ["external-url"],
            chainId: "solana",
            chainName: "Solana",
            chainType: "solana",
            denom: solanaCounterparty.symbol,
            address: solanaCounterparty.sourceDenom,
            decimals: solanaCounterparty.decimals,
          },
        ];
      }
    }

    return [];
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Picasso transactions are currently not supported.");
  }

  async getExternalUrl({
    fromChain,
    toChain,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    // For now we use Portal Bridge
    const url = new URL("https://app.picasso.network/");

    if (fromChain) {
      url.searchParams.set(
        "from",
        fromChain.chainName?.toUpperCase() ?? fromChain.chainId.toString()
      );
    }

    if (toChain) {
      url.searchParams.set(
        "to",
        toChain.chainName?.toUpperCase() ?? toChain.chainId.toString()
      );
    }

    return {
      urlProviderName: "Picasso",
      url,
    };
  }
}
