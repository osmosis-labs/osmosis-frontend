import { Chain } from "@osmosis-labs/types";
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
}: {
  orderbookAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: orderbookDenomsCache,
    key: `orderbookDenoms-${orderbookAddress}`,
    ttl: 1000 * 60 * 60 * 24 * 7, // 7 days
    getFreshValue: () =>
      queryOrderbookDenoms({ orderbookAddress, chainList }).then(
        ({ data }) => data
      ),
  });
}
