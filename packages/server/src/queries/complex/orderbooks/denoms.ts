import { AssetList, Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookDenoms } from "../../osmosis";

const orderbookDenomsCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookDenoms({
  orderbookAddress,
  chainList,
  assetLists,
}: {
  orderbookAddress: string;
  chainList: Chain[];
  assetLists: AssetList[];
}) {
  return cachified({
    cache: orderbookDenomsCache,
    key: `orderbookDenoms-${orderbookAddress}`,
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
    getFreshValue: () =>
      queryOrderbookDenoms({ orderbookAddress, chainList }).then(
        ({ data: { quote_denom, base_denom } }) => {
          const quoteAsset = getAssetFromAssetList({
            coinMinimalDenom: quote_denom,
            assetLists,
          });
          const baseAsset = getAssetFromAssetList({
            coinMinimalDenom: base_denom,
            assetLists,
          });

          return { quoteAsset, baseAsset };
        }
      ),
  });
}
