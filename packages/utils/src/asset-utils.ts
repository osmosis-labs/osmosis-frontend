import type { Asset, AssetList, Currency } from "@osmosis-labs/types";

/** Find asset in asset list config given any of the available identifiers. */
export function getAssetFromAssetList({
  symbol,
  /** Denom as it exists on source chain. */
  sourceDenom,
  coinMinimalDenom,
  coinGeckoId,
  assetLists,
}: {
  symbol?: string;
  sourceDenom?: string;
  coinMinimalDenom?: string;
  coinGeckoId?: string;
  assetLists: AssetList[];
}) {
  if (!symbol && !sourceDenom && !coinGeckoId && !coinMinimalDenom) {
    return undefined;
  }

  const asset = assetLists
    .flatMap(({ assets }) => assets)
    .find(
      (asset) =>
        (symbol && asset.symbol === symbol) ||
        (sourceDenom && asset.sourceDenom === sourceDenom) ||
        (asset.coingeckoId ? asset.coingeckoId === coinGeckoId : false) ||
        asset.coinMinimalDenom === coinMinimalDenom
    );

  if (!asset) return undefined;

  return {
    sourceDenom: asset.sourceDenom,
    coinMinimalDenom: asset.coinMinimalDenom,
    symbol: asset.symbol,
    coinGeckoId: asset.coingeckoId,
    priceInfo: asset.price,
    decimals: asset.decimals,
    rawAsset: asset,
    currency: {
      coinDenom: asset.symbol,
      coinMinimalDenom: asset.coinMinimalDenom,
      coinDecimals: asset.decimals,
      coinImageUrl: asset.relative_image_url,
    },
  };
}

/** Convert an asset list asset into an asset with minimal content and that
 *  is compliant with the `Currency` type. */
export function makeMinimalAsset(assetListAsset: Asset): Currency & {
  coinGeckoId: string | undefined;
  coinName: string;
  isUnstable: boolean;
  isVerified: boolean;
} {
  const {
    decimals,
    symbol,
    coinMinimalDenom,
    relative_image_url,
    coingeckoId,
    name,
    unstable,
    verified,
  } = assetListAsset;

  return {
    coinDenom: symbol,
    coinName: name,
    coinMinimalDenom,
    coinDecimals: decimals,
    coinGeckoId: coingeckoId,
    coinImageUrl: relative_image_url,
    isUnstable: unstable,
    isVerified: verified,
  };
}
