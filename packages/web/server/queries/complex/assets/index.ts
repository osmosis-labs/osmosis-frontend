import { Asset } from "@osmosis-labs/types";
import { getDisplayDecimalsFromAsset } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import Fuse from "fuse.js";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { Search, Sort } from "../parameter-types";

export type GetAssetsParams = { sort?: Partial<Sort>; search?: Search };
const searchableKeys = ["symbol", "base", "name", "display"];

const cache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Cached function that returns minimal asset  */
export async function getAssets(
  params: GetAssetsParams,
  assetList = AssetLists
) {
  return cachified({
    cache,
    getFreshValue: async () => {
      // create new array with just assets
      const coinMinimalDenomSet = new Set<string>();
      let assets = assetList
        .flatMap(({ assets }) => assets)
        .filter((asset) => {
          // Ensure denoms are unique on Osmosis chain
          // In the case the asset list has the same asset twice
          if (coinMinimalDenomSet.has(asset.base)) {
            return false;
          } else {
            coinMinimalDenomSet.add(asset.base);
            return true;
          }
        });

      // search
      if (params.search) {
        const fuse = new Fuse(assets, {
          keys: searchableKeys,
          isCaseSensitive: true,
        });
        assets = fuse
          .search(params.search.query)
          .map(({ item }) => item)
          .slice(0, params.search.limit);
      }

      // transform into a more compact object
      const minimalAssets = assets.map(makeMinimalAsset);

      // sort
      if (params.sort && params.sort.keyPath) {
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

function makeMinimalAsset(assetListAsset: Asset) {
  const { symbol, base, relative_image_url, coingecko_id, name, keywords } =
    assetListAsset;
  const decimals = getDisplayDecimalsFromAsset(assetListAsset);

  const currency = {
    coinDenom: symbol,
    coinName: name,
    coinMinimalDenom: base,
    coinDecimals: decimals,
    coinGeckoId: coingecko_id,
    coinImageUrl: relative_image_url,
    isVerified: Boolean(keywords?.includes("osmosis-main")),
  };

  return {
    ...currency,
  };
}

export * from "./price";
