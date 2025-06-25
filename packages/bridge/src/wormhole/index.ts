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
    // Use local Wormhole Connect instead of Portal Bridge
    const urlPath = "/wormhole";
    const params = new URLSearchParams();

    if (fromChain) {
      params.set(
        "from",
        fromChain.chainName?.toLowerCase() ?? fromChain.chainId.toString()
      );
    }

    if (toChain) {
      params.set(
        "to",
        toChain.chainName?.toLowerCase() ?? toChain.chainId.toString()
      );
    }

    // Use token symbol for the token parameter
    const tokenSymbol = fromAsset?.denom || toAsset?.denom;
    if (tokenSymbol) {
      params.set("token", tokenSymbol);
    }

    // Construct the final URL with query parameters
    const queryString = params.toString();
    const fullPath = queryString ? `${urlPath}?${queryString}` : urlPath;

    // Create URL with proper relative path handling
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "https://app.osmosis.zone";
    const url = new URL(fullPath, baseUrl);

    return {
      urlProviderName: "Wormhole Connect",
      url,
    };
  }
}
