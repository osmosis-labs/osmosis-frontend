import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { LimitOrder, queryOrderbookActiveOrders } from "../../osmosis";

const activeOrdersCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getOrderbookActiveOrders({
  orderbookAddress,
  userOsmoAddress,
  chainList,
}: {
  orderbookAddress: string;
  userOsmoAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: activeOrdersCache,
    key: `orderbookActiveOrders-${orderbookAddress}-${userOsmoAddress}`,
    ttl: 1000 * 3, // 30 seconds
    getFreshValue: () =>
      queryOrderbookActiveOrders({
        orderbookAddress,
        userAddress: userOsmoAddress,
        chainList,
      }).then(
        ({ data }: { data: { count: number; orders: LimitOrder[] } }) => data
      ),
  });
}
