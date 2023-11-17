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

export type GetAssetsParams = Partial<Sort<"symbol" | "base"> & Search>;
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
            return a.symbol.localeCompare(b.symbol);
          } else if (params.keyPath === "base") {
            return a.base.localeCompare(b.base);
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
  const { symbol, base, relative_image_url } = assetListAsset;
  const decimals = getDisplayDecimalsFromAsset(assetListAsset);
  const minimalDenom = getMinimalDenomFromAssetList(assetListAsset);

  return {
    symbol,
    base,
    decimals,
    minimalDenom,
    imageUrl: relative_image_url,
  };
}

export * from "./price";
