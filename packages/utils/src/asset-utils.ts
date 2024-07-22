import type {
  Asset,
  AssetList,
  Counterparty,
  MinimalAsset,
} from "@osmosis-labs/types";

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
export function makeMinimalAsset(assetListAsset: Asset): MinimalAsset {
  const {
    decimals,
    symbol,
    coinMinimalDenom,
    relative_image_url,
    coingeckoId,
    name,
    unstable,
    verified,
    isAlloyed,
    contract,
    variantGroupKey,
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
    variantGroupKey,
    isAlloyed,
    contract,
  };
}

export function isSameVariant(
  assetLists: AssetList[],
  rootAssetDenom: string,
  compareAssetDenom: string
): boolean {
  const findAssetByDenom = (assetList: AssetList, denom: string) => {
    return assetList.assets.find((asset) => asset.coinMinimalDenom === denom);
  };

  const rootAsset = assetLists
    .map((assetList) => findAssetByDenom(assetList, rootAssetDenom))
    .find((asset) => asset);

  const compareAsset = assetLists
    .map((assetList) => findAssetByDenom(assetList, compareAssetDenom))
    .find((asset) => asset);

  if (!rootAsset && !compareAsset) {
    return false;
  }

  if (!rootAsset) {
    // Try recursively with compare asset as root
    return isSameVariant(assetLists, compareAssetDenom, rootAssetDenom);
  }

  // directly compare variantGroupKey
  if (
    compareAsset &&
    rootAsset.variantGroupKey === compareAsset.variantGroupKey
  ) {
    return true;
  }

  // compare all counterparty entries for same variant
  if (rootAsset.variantGroupKey) {
    const counterparties = assetLists
      .flatMap(({ assets }) => assets)
      .reduce((acc, asset) => {
        if (asset.variantGroupKey === rootAsset.variantGroupKey) {
          acc.push(...asset.counterparty);
        }
        return acc;
      }, [] as Counterparty[]);

    for (const counterparty of counterparties) {
      if (
        "address" in counterparty &&
        counterparty.address.toLowerCase() === compareAssetDenom.toLowerCase()
      ) {
        return true;
      }
      if (
        "sourceDenom" in counterparty &&
        counterparty.sourceDenom.toLowerCase() ===
          compareAssetDenom.toLowerCase()
      ) {
        return true;
      }
    }
  }

  return false;
}
