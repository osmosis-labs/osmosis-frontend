import { Asset } from "@osmosis-labs/types";
import {
  getDisplayDecimalsFromAsset,
  getMinimalDenomFromAssetList,
} from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";
import { superjson } from "~/utils/superjson";

import { Search, Sort } from "../parameter-types";

export type GetAssetsParams = Partial<Sort & Search>;

const cache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Cached function that returns minimal asset  */
export async function getAssets(params: GetAssetsParams) {
  return cachified({
    cache,
    getFreshValue: async () => {
      // Your logic to search and sort assets from AssetLists
      AssetLists.flatMap((assetList) => assetList.assets).map(getAsset);
    },
    key: superjson.serialize(params).json?.toString() ?? "",
  });
}

function getAsset(assetListAsset: Asset) {
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
