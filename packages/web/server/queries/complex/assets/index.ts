import { Asset } from "@osmosis-labs/types";
import {
  getDisplayDecimalsFromAsset,
  getMinimalDenomFromAssetList,
} from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import Fuse from "fuse.js";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { Search, Sort } from "../parameter-types";

export type GetAssetsParams = Partial<Sort & Search>;
const searchableKeys = ["coinDenom", "coinMinimalDenom", "name", "display"];

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
      let assets = assetList.flatMap(({ assets }) => assets);

      // search
      if (params.query) {
        const fuse = new Fuse(assets, { keys: searchableKeys });
        assets = fuse.search(params.query).map(({ item }) => item);
      }

      // transform into a more compact object
      const minimalAssets = assets.map(makeMinimalAsset);

      // sort
      if (params.keyPath) {
        minimalAssets.sort((a, b) => {
          if (params.keyPath === "symbol") {
            return a.coinDenom.localeCompare(b.coinDenom);
          } else if (params.keyPath === "coinMinimalDenom") {
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
  const { symbol, relative_image_url } = assetListAsset;
  const decimals = getDisplayDecimalsFromAsset(assetListAsset);
  const minimalDenom = getMinimalDenomFromAssetList(assetListAsset);

  const currency = {
    coinDenom: symbol,
    coinMinimalDenom: minimalDenom,
    coinDecimals: decimals,
    coinImageUrl: relative_image_url,
  };

  return {
    ...currency,
  };
}

export * from "./price";
