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

export class WormholeBridgeProvider implements BridgeProvider {
  static readonly ID = "Wormhole";
  readonly providerName = WormholeBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Wormhole quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<
    (BridgeChain & BridgeSupportedAsset)[]
  > {
    // just supports SOL via Wormhole

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
    throw new Error("Wormhole transactions are currently not supported.");
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    // For now we use Portal Bridge
    const url = new URL("https://portalbridge.com/");

    if (fromChain?.chainType === "cosmos" || toChain?.chainType === "cosmos") {
      url.pathname = "/cosmos/";
    }

    if (fromChain) {
      url.searchParams.set(
        "sourceChain",
        fromChain.chainName?.toLowerCase() ?? fromChain.chainId.toString()
      );
      if (fromChain.chainType === "solana" && fromAsset) {
        url.searchParams.set("asset", fromAsset.address);
      }
    }

    if (toChain) {
      url.searchParams.set(
        "targetChain",
        toChain.chainName?.toLowerCase() ?? toChain.chainId.toString()
      );
      if (fromChain?.chainType !== "solana" && toAsset) {
        url.searchParams.set("asset", toAsset.address);
      }
    }

    return {
      urlProviderName: "Portal",
      url,
    };
  }
}
