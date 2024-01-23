import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { calcAssetValue } from "~/server/queries/complex/assets/price";
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
  includeUnlisted: z.boolean().default(false).optional(),
});
/** Params for filtering assets. */
export type AssetFilter = z.input<typeof AssetFilterSchema>;

/** Search is performed on the raw asset list data, instead of `Asset` type. */
const searchableAssetListAssetKeys = ["symbol", "base", "name", "display"];
/** Get an individual asset explicitly by it's denom (any type).
 *  @throws If asset not found. */
export async function getAsset({
  assetList = AssetLists,
  anyDenom,
  ...params
}: {
  assetList?: AssetList[];
  anyDenom: string;
}): Promise<Asset> {
  const assets = await getAssets({
    assetList,
    findMinDenomOrSymbol: anyDenom,
    includeUnlisted: true,
    ...params,
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
      getFreshValue: () => simplifyAssetListForDisplay(assetList, params),
    });
  }

  // otherwise process the given novel asset list
  return simplifyAssetListForDisplay(assetList, params);
}

/** Transform given asset list into an array of minimal asset types for user in frontend. */
function simplifyAssetListForDisplay(
  assetList: AssetList[],
  params: {
    findMinDenomOrSymbol?: string;
  } & AssetFilter = {}
): Asset[] {
  // Create new array with just assets
  const coinMinimalDenomSet = new Set<string>();

  const listedAssets = assetList
    .flatMap(({ assets }) => assets)
    .filter((asset) =>
      params.includeUnlisted
        ? true // Do not filter the unlisted assets
        : !asset.keywords?.includes("osmosis-unlisted")
    );

  let assetListAssets = listedAssets.filter((asset) => {
    if (params.findMinDenomOrSymbol) {
      return (
        params.findMinDenomOrSymbol.toUpperCase() ===
          asset.base.toUpperCase() ||
        params.findMinDenomOrSymbol.toUpperCase() === asset.symbol.toUpperCase()
      );
    }

    // Ensure denoms are unique on Osmosis chain
    // In the case the asset list has the same asset twice
    if (coinMinimalDenomSet.has(asset.base)) {
      return false;
    } else {
      coinMinimalDenomSet.add(asset.base);
      return true;
    }
  });

  // Search raw asset list before reducing type to minimal Asset type
  if (params.search) {
    assetListAssets = search(
      assetListAssets,
      searchableAssetListAssetKeys,
      params.search
    );
  }

  // Filter by only verified
  if (params.onlyVerified) {
    assetListAssets = assetListAssets.filter((asset) =>
      Boolean(asset.keywords?.includes("osmosis-main"))
    );
  }

  // Transform into a more compact object
  return assetListAssets.map(makeMinimalAsset);
}

/**
 * This function maps raw assets to a CoinPretty. This is useful for
 * converting raw assets returned from chain. It also optionally
 * calculates the fiat value of the asset if the 'calculatePrice'
 * parameter is true.
 *
 * @param {Array} rawAssets An array of raw assets. Each raw asset is an object with an 'amount' and 'denom' property.
 * @param {boolean} calculatePrice A boolean indicating whether to calculate the price of the asset.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of CoinPretty objects. Each CoinPretty object represents an asset and has an optional 'fiatValue' property.
 */
export async function mapRawAssetsToCoinPretty({
  rawAssets,
  calculatePrice,
}: {
  rawAssets?: {
    amount: string | number;
    denom: string;
  }[];
  calculatePrice?: boolean;
}): Promise<(CoinPretty & { fiatValue?: PricePretty })[]> {
  if (!rawAssets) return [];
  const result = await Promise.all(
    rawAssets.map(async ({ amount, denom }) => {
      const asset = await getAsset({
        anyDenom: denom,
      });

      if (!asset) return undefined;

      const coin = new CoinPretty(asset, amount);
      if (calculatePrice) {
        const fiatValue = await calcAssetValue({
          amount: coin.toString(),
          anyDenom: denom,
        });

        if (fiatValue) {
          (coin as CoinPretty & { fiatValue?: PricePretty }).fiatValue =
            new PricePretty(DEFAULT_VS_CURRENCY, fiatValue);
        }
      }

      return coin;
    })
  );
  return result.filter((p): p is NonNullable<typeof p> => !!p);
}

export * from "./info";
export * from "./market";
export * from "./price";
export * from "./user";
