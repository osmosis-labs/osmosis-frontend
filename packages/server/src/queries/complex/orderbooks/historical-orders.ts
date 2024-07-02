import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryHistoricalOrders } from "../../osmosis";

const orderbookHistoricalOrdersCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getOrderbookHistoricalOrders({
  userOsmoAddress,
}: {
  userOsmoAddress: string;
}) {
  return cachified({
    cache: orderbookHistoricalOrdersCache,
    key: `orderbookHistoricalOrders-${userOsmoAddress}`,
    ttl: 1000 * 3, // 3 seconds
    getFreshValue: () =>
      queryHistoricalOrders(userOsmoAddress).then((data) => data),
  });
}
