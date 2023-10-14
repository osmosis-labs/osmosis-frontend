import type { Asset } from "@chain-registry/types";

import { WalletAssets } from "~/config/generated/wallet-assets";
import { hasMatchingMinimalDenom } from "~/config/utils";

/**
 * Get's asset from wallet assets by minimal denom.
 * We have to use this since our asset list coingecko ids are
 * not accurate given some rely on pool pricing.
 *
 * TODO: Refactor once we have Osmosis assetlists
 * @see https://github.com/osmosis-labs/assetlists
 */
export function getAssetFromWalletAssets(coinMinimalDenom: string) {
  let asset: Asset | undefined;

  for (const assetList of WalletAssets) {
    const walletAsset = assetList.assets.find((asset) =>
      hasMatchingMinimalDenom(asset, coinMinimalDenom)
    );

    if (walletAsset) {
      asset = walletAsset;
      break;
    }
  }

  return asset;
}
