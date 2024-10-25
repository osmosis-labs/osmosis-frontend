import { CoinPretty } from "@keplr-wallet/unit";
import {
  Asset as AssetListAsset,
  AssetList,
  MinimalAsset,
} from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import { z } from "zod";

import { captureErrorAndReturn } from "../../../utils/error";
import { search, SearchSchema } from "../../../utils/search";
import { isAssetInCategories } from "./categories";

export const AssetFilterSchema = z.object({
  search: SearchSchema.optional(),
  onlyVerified: z.boolean().default(false).optional(),
  includePreview: z.boolean().default(false).optional(),
  categories: z.array(z.string()).optional(),
});
/** Params for filtering assets. */
export type AssetFilter = z.input<typeof AssetFilterSchema>;

/** Get an individual asset explicitly by it's denom (any type).
 *  @throws If asset not found. */
export function getAsset({
  assetLists,
  anyDenom,
}: {
  assetLists: AssetList[];
  anyDenom: string;
}): MinimalAsset {
  const assets = getAssets({
    assetLists,
    findMinDenomOrSymbol: anyDenom,
    includePreview: true,
  });
  const asset = assets[0];
  if (!asset) throw new Error(anyDenom + " not found in asset list");
  return asset;
}

/**
 * Retrieves an asset along with its variants from the provided asset lists.
 * Canonical asset is placed at the beginning of the array.
 *
 * @throws Will throw an error if the asset is not found in the asset lists.
 */
export function getAssetWithVariants({
  assetLists,
  anyDenom,
}: {
  assetLists: AssetList[];
  anyDenom: string;
}) {
  const asset = getAsset({
    assetLists,
    anyDenom,
  });

  if (!asset) throw new Error(anyDenom + " not found in asset list");

  const variants = getAssets({
    assetLists,
    includePreview: true,
  }).filter((a) => a?.variantGroupKey === asset.variantGroupKey);

  return (
    variants
      // place the canonical asset at the beginning
      .sort((a) => (a.coinMinimalDenom === asset.variantGroupKey ? -1 : 1))
  );
}

/** Returns minimal asset information for assets in asset list. Return values can double as the `Currency` type.
 *  Search was added to this function since members of the asset list type are search before mapped
 *  into minimal assets. See `searchableAssetListAssetKeys` for the keys that are searched.
 *
 *  Please avoid changing this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export function getAssets({
  assetLists,
  ...params
}: {
  assetLists: AssetList[];
  /** Explicitly match the base or symbol denom. */
  findMinDenomOrSymbol?: string;
} & AssetFilter): MinimalAsset[] {
  return filterAssetList(assetLists, params);
}

/**
 * This function coins to a CoinPretty if listed in asset list. This is useful for
 * converting raw assets returned from chain into coins listed in asset list.
 *
 * @param rawAssets An array of raw assets. Each raw asset is an object with an 'amount' and 'denom' property.
 *
 * @returns A promise that resolves to an array of CoinPretty objects. Each CoinPretty object represents an asset that is listed. Unlisted assets are filtered.
 */
export function mapRawCoinToPretty(
  assetLists: AssetList[],
  rawAssets: {
    amount: ConstructorParameters<typeof CoinPretty>[1];
    denom: string;
  }[]
): CoinPretty[] {
  return rawAssets
    .map(({ amount, denom }) => {
      try {
        const asset = getAsset({ assetLists, anyDenom: denom });
        return new CoinPretty(asset, amount);
      } catch (e) {
        return captureErrorAndReturn(e as Error, undefined);
      }
    })
    .filter((asset): asset is CoinPretty => !!asset);
}

/** Transform given asset list into an array of minimal asset types for user in frontend and apply given filters. */
function filterAssetList(
  assetLists: AssetList[],
  params: {
    findMinDenomOrSymbol?: string;
  } & AssetFilter
): MinimalAsset[] {
  // Create new array with just assets
  const coinMinimalDenomSet = new Set<string>();

  const listedAssets = assetLists
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
    // search for exact match for coinMinimalDenom first
    const coinMinimalDemonMatches = search(
      assetListAssets,
      ["coinMinimalDenom"] as (keyof AssetListAsset)[],
      params.search,
      0.0 // Exact match
    );

    // if not exact match for coinMinimalDenom, search by symbol or name
    if (coinMinimalDemonMatches.length > 0) {
      assetListAssets = coinMinimalDemonMatches;
    } else {
      const symbolOrNameMatches = search(
        assetListAssets,
        /** Search is performed on the raw asset list data, instead of `Asset` type. */
        ["symbol", "name"] as (keyof AssetListAsset)[],
        params.search,
        0.2
      );
      assetListAssets = symbolOrNameMatches;
    }
  }

  // Filter by only verified
  if (params.onlyVerified) {
    assetListAssets = assetListAssets.filter((asset) => asset.verified);
  }

  // Filter categories
  const categories = params.categories;
  if (categories) {
    assetListAssets = assetListAssets.filter((asset) =>
      isAssetInCategories(asset, categories)
    );
  }

  // Transform into a more compact object
  return assetListAssets.map(makeMinimalAsset);
}

export * from "./bridge";
export * from "./categories";
export * from "./config";
export * from "./ethereum";
export * from "./gas";
export * from "./market";
export * from "./price";
export * from "./user";
