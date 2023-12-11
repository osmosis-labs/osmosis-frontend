import { AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import Fuse from "fuse.js";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { Search, Sort } from "../parameter-types";

const searchableKeys = ["symbol", "base", "name", "display"];

const cache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Get an individual asset explicitly by it's denom (any type) */
export async function getAsset({
  anyDenom,
}: {
  anyDenom: string;
}): Promise<ReturnType<typeof makeMinimalAsset> | undefined> {
  const assets = await getAssets({ findMinDenomOrSymbol: anyDenom });
  return assets[0];
}

/** Cached function that returns minimal asset information. Return values can double as the `Currency` type.
 *  Please avoid adding to this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export async function getAssets({
  assetList = AssetLists,
  ...params
}: {
  sort?: Partial<Sort>;
  search?: Search;
  /** Explicitly match the base or symbol denom. */
  findMinDenomOrSymbol?: string;
  assetList?: AssetList[];
}) {
  return cachified({
    cache,
    getFreshValue: async () => {
      // Create new array with just assets
      const coinMinimalDenomSet = new Set<string>();

      const listedAssets = assetList
        .flatMap(({ assets }) => assets)
        .filter(
          (asset) =>
            asset.keywords && !asset.keywords.includes("osmosis-unlisted")
        );

      let assets = listedAssets.filter((asset) => {
        if (params.findMinDenomOrSymbol) {
          return (
            params.findMinDenomOrSymbol.toUpperCase() ===
              asset.base.toUpperCase() ||
            params.findMinDenomOrSymbol.toUpperCase() ===
              asset.symbol.toUpperCase()
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

      // Search
      if (params.search) {
        const fuse = new Fuse(assets, {
          keys: searchableKeys,
        });
        assets = fuse
          .search(params.search.query)
          .map(({ item }) => item)
          .slice(0, params.search.limit);
      }

      // Transform into a more compact object
      const minimalAssets = assets.map(makeMinimalAsset);

      // Sort
      if (params.sort && params.sort.keyPath && !params.search) {
        const keyPath = params.sort.keyPath;
        minimalAssets.sort((a, b) => {
          if (keyPath === "coinDenom") {
            return a.coinDenom.localeCompare(b.coinDenom);
          } else if (keyPath === "coinMinimalDenom") {
            return a.coinMinimalDenom.localeCompare(b.coinMinimalDenom);
          } else {
            return 0;
          }
        });
      }

      return minimalAssets;
    },
    key: JSON.stringify(params),
  });
}

export * from "./price";
