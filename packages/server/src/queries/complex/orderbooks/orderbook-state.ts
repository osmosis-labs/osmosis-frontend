import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryOrderbookActiveState, queryOrderbookState } from "../../osmosis";

const orderbookStateCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookState({
  orderbookAddress,
  chainList,
}: {
  orderbookAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: orderbookStateCache,
    key: `orderbookState-${orderbookAddress}`,
    ttl: 1000 * 3, // 3 seconds
    getFreshValue: () =>
      queryOrderbookState({
        orderbookAddress,
        chainList,
      }).then(({ data }) => data),
  });
}

export function getOrderbookActiveState({
  orderbookAddress,
  chainList,
}: {
  orderbookAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: orderbookStateCache,
    key: `orderbookActiveState-${orderbookAddress}`,
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: () =>
      queryOrderbookActiveState({
        orderbookAddress,
        chainList,
      }).then(({ data }) => data),
  });
}
