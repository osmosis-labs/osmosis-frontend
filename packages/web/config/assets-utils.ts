import type { Asset } from "@chain-registry/types";

import { WalletAssets } from "~/config/generated/wallet-assets";
import { hasMatchingMinimalDenom } from "~/config/utils";

/**
 * Gets asset from wallet assets by minimal denom.
 * We have to use this since our asset list coingecko ids are
 * not accurate given some rely on pool pricing.
 *
 * TODO: Refactor once we have Osmosis assetlists
 * @see https://github.com/osmosis-labs/assetlists
 */
export function getAssetFromWalletAssets({
  minimalDenom,
  coingeckoId,
}: {
  minimalDenom?: string;
  coingeckoId?: string;
}) {
  if (!minimalDenom && !coingeckoId) return undefined;

  let asset: Asset | undefined;

  for (const assetList of WalletAssets) {
    const walletAsset = assetList.assets.find(
      (asset) =>
        hasMatchingMinimalDenom(asset, minimalDenom ?? "") ||
        (asset.coingecko_id ? asset.coingecko_id === coingeckoId : false)
    );

    if (walletAsset) {
      asset = walletAsset;
      break;
    }
  }

  if (!asset) return undefined;

  return {
    minimalDenom: minimalDenom,
    symbol: asset.symbol,
    coingeckoId: asset.coingecko_id,
    decimals: asset.denom_units.find((a) => a.denom === asset?.display)
      ?.exponent,
  };
}
