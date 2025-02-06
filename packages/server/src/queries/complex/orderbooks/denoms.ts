import { AssetList, Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { getOrderbookPools } from "./pools";

const orderbookDenomsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookDenoms({
  orderbookAddress,
  assetLists,
}: {
  orderbookAddress: string;
  chainList: Chain[];
  assetLists: AssetList[];
}) {
  return cachified({
    cache: orderbookDenomsCache,
    key: `orderbookDenoms-${orderbookAddress}`,
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days (unlikely to change)
    getFreshValue: () =>
      getOrderbookPools().then((pools) => {
        const pool = pools.find((p) => p.contractAddress === orderbookAddress);
        if (!pool)
          return {
            quoteAsset: undefined,
            baseAsset: undefined,
          };
        const quoteAsset = getAssetFromAssetList({
          coinMinimalDenom: pool.quoteDenom,
          assetLists,
        });
        const baseAsset = getAssetFromAssetList({
          coinMinimalDenom: pool.baseDenom,
          assetLists,
        });

        return { quoteAsset, baseAsset };
      }),
  });
}
