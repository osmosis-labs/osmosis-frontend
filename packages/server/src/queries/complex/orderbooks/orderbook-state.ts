import { Chain } from "@osmosis-labs/types";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { cached, type CacheEntry } from "../../../utils/cached";
import { queryOrderbookState } from "../../osmosis";

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
  return cached({
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
