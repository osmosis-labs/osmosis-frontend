import {
  NativeEVMTokenConstantAddress,
  TronChainInfo,
} from "@osmosis-labs/utils";
import basex from "base-x";

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

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = basex(BASE58);

export class NitroBridgeProvider implements BridgeProvider {
  static readonly ID = "Nitro";
  readonly providerName = NitroBridgeProvider.ID;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  async getQuote(): Promise<BridgeQuote> {
    throw new Error("Nitro quotes are currently not supported.");
  }

  async getSupportedAssets({
    asset,
  }: GetBridgeSupportedAssetsParams): Promise<(BridgeChain & BridgeAsset)[]> {
    try {
      // just supports TRX, TRX.rt from Tron

      const assets = this.ctx.assetLists.flatMap(({ assets }) => assets);
      const assetListAsset = assets.find(
        (a) => a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
      );

      if (assetListAsset) {
        const variants = assets
          .filter((a) => a?.variantGroupKey === assetListAsset.variantGroupKey)
          .sort((a) =>
            a.coinMinimalDenom === assetListAsset.variantGroupKey ? -1 : 1
          );

        const tronAsset = variants.length > 1 ? variants[1] : variants[0];

        const tronCounterparty = tronAsset.counterparty.find(
          (c) => c.chainName === "tron"
        );

        if (tronCounterparty) {
          const isTRC20Token = tronCounterparty.sourceDenom.startsWith("T");
          const address = isTRC20Token
            ? Buffer.from(bs58.decode(tronCounterparty.sourceDenom))
                .toString("hex")
                // Tron addresses in hexadecimal format always start with '41'.
                // This prefix should be replaced with '0x' to convert it to a valid address.
                .replace("41", "0x")
                .substring(0, 42) // Tron addresses are 21 bytes long, so we need to truncate the last byte.
            : undefined;

          const resolvedAddress =
            tronCounterparty.sourceDenom === "sun"
              ? NativeEVMTokenConstantAddress // Nitro uses the constant address to reference the native token
              : address ?? tronCounterparty.sourceDenom;

          return [
            {
              chainType: "tron",
              chainId: TronChainInfo.chainId,
              chainName: TronChainInfo.chainName,
              denom: tronCounterparty.symbol,
              address: resolvedAddress,
              decimals: tronCounterparty.decimals,
            },
          ];
        }
      }

      return [];
    } catch (e) {
      // Avoid returning options if there's an unexpected error, such as the provider being down
      if (process.env.NODE_ENV !== "production") {
        console.error(
          NitroBridgeProvider.ID,
          "failed to get supported assets:",
          e
        );
      }
      return [];
    }
  }

  async getTransactionData(): Promise<BridgeTransactionRequest> {
    throw new Error("Nitro transactions are currently not supported.");
  }

  async getExternalUrl({
    fromChain,
    toChain,
    fromAsset,
    toAsset,
  }: GetBridgeExternalUrlParams): Promise<BridgeExternalUrl | undefined> {
    const url = new URL("https://beta-mainnet.routernitro.com/swap");

    if (fromChain) {
      url.searchParams.set("fromChain", String(fromChain.chainId));
    }

    if (toChain) {
      url.searchParams.set("toChain", String(toChain.chainId));
    }

    const setTokenParam = (asset: BridgeAsset, param: string) => {
      if (asset.address.includes("alloyed")) {
        const assets = this.ctx.assetLists.flatMap(({ assets }) => assets);
        const alloy = assets.find(
          (a) =>
            a.coinMinimalDenom.toLowerCase() === asset.address.toLowerCase()
        );
        const variant = assets.find(
          (a) =>
            a.variantGroupKey === alloy?.variantGroupKey &&
            a.coinMinimalDenom !== alloy?.coinMinimalDenom
        );
        if (variant) url.searchParams.set(param, variant.coinMinimalDenom);
      } else {
        url.searchParams.set(param, asset.address);
      }
    };

    if (fromAsset) setTokenParam(fromAsset, "fromToken");
    if (toAsset) setTokenParam(toAsset, "toToken");

    return {
      urlProviderName: "Nitro",
      url,
    };
  }
}
