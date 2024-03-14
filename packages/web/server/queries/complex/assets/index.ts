import { CoinPretty } from "@keplr-wallet/unit";
import { Asset as AssetListAsset, AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { AssetLists } from "~/config/generated/asset-lists";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";
import { captureErrorAndReturn } from "~/utils/error";
import { search, SearchSchema } from "~/utils/search";

/** An asset with minimal data that conforms to `Currency` type. */
export type Asset = {
  coinDenom: string;
  coinName: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  coinGeckoId: string | undefined;
  coinImageUrl?: string;
  isVerified: boolean;
  isUnstable: boolean;
};

export const AssetFilterSchema = z.object({
  search: SearchSchema.optional(),
  onlyVerified: z.boolean().default(false).optional(),
  includePreview: z.boolean().default(false).optional(),
});
/** Params for filtering assets. */
export type AssetFilter = z.input<typeof AssetFilterSchema>;

/** Search is performed on the raw asset list data, instead of `Asset` type. */
const searchableAssetListAssetKeys: (keyof AssetListAsset)[] = [
  "symbol",
  "coinMinimalDenom",
  "name",
];
/** Get an individual asset explicitly by it's denom (any type).
 *  @throws If asset not found. */
export async function getAsset({
  assetList = AssetLists,
  anyDenom,
}: {
  assetList?: AssetList[];
  anyDenom: string;
}): Promise<Asset> {
  const assets = await getAssets({
    assetList,
    findMinDenomOrSymbol: anyDenom,
    includePreview: true,
  });
  const asset = assets[0];
  if (!asset) throw new Error(anyDenom + " not found in asset list");
  return asset;
}

const minimalAssetsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
/** Cached function that returns minimal asset information. Return values can double as the `Currency` type.
 *  Search was added to this function since members of the asset list type are search before mapped
 *  into minimal assets. See `searchableAssetListAssetKeys` for the keys that are searched.
 *
 *  Please avoid changing this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export async function getAssets({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  /** Explicitly match the base or symbol denom. */
  findMinDenomOrSymbol?: string;
} & AssetFilter = {}): Promise<Asset[]> {
  // if it's the default asset list, cache it
  if (assetList === AssetLists) {
    return cachified({
      cache: minimalAssetsCache,
      key: JSON.stringify(params),
      getFreshValue: () => filterAssetList(assetList, params),
    });
  }

  // otherwise process the given novel asset list
  return filterAssetList(assetList, params);
}

/**
 * This function coins to a CoinPretty if listed in asset list. This is useful for
 * converting raw assets returned from chain into coins listed in asset list.
 *
 * @param rawAssets An array of raw assets. Each raw asset is an object with an 'amount' and 'denom' property.
 *
 * @returns A promise that resolves to an array of CoinPretty objects. Each CoinPretty object represents an asset that is listed. Unlisted assets are filtered.
 */
export async function mapRawCoinToPretty(
  rawAssets: {
    amount: ConstructorParameters<typeof CoinPretty>[1];
    denom: string;
  }[]
): Promise<CoinPretty[]> {
  if (!rawAssets) return [];
  return await Promise.all(
    rawAssets.map(({ amount, denom }) =>
      getAsset({
        anyDenom: denom,
      })
        .then((asset) => new CoinPretty(asset, amount))
        .catch((e) => captureErrorAndReturn(e, undefined))
    )
  ).then((assets) => assets.filter((asset): asset is CoinPretty => !!asset));
}

/** Transform given asset list into an array of minimal asset types for user in frontend and apply given filters. */
function filterAssetList(
  assetList: AssetList[],
  params: {
    findMinDenomOrSymbol?: string;
  } & AssetFilter = {}
): Asset[] {
  // Create new array with just assets
  const coinMinimalDenomSet = new Set<string>();

  const listedAssets = assetList
    .flatMap(({ assets }) => assets)
    .filter((asset) => params.includePreview || !asset.preview);

  let assetListAssets = listedAssets.filter((asset) => {
    if (params.findMinDenomOrSymbol) {
      return (
        params.findMinDenomOrSymbol.toUpperCase() ===
          asset.coinMinimalDenom.toUpperCase() ||
        params.findMinDenomOrSymbol.toUpperCase() === asset.symbol.toUpperCase()
      );
    }

    // Ensure denoms are unique on Osmosis chain
    // In the case the asset list has the same asset twice
    if (coinMinimalDenomSet.has(asset.coinMinimalDenom)) {
      return false;
    } else {
      coinMinimalDenomSet.add(asset.coinMinimalDenom);
      return true;
    }
  });

  // Search raw asset list before reducing type to minimal Asset type
  if (params.search && !params.findMinDenomOrSymbol) {
    assetListAssets = search(
      assetListAssets,
      searchableAssetListAssetKeys,
      params.search
    );
  }

  // Filter by only verified
  if (params.onlyVerified) {
    assetListAssets = assetListAssets.filter((asset) => asset.verified);
  }

  // Transform into a more compact object
  return assetListAssets.map(makeMinimalAsset);
}

export * from "./market";
export * from "./price";
export * from "./user";
