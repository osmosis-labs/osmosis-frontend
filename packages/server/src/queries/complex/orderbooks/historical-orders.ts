import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { HistoricalLimitOrder, queryHistoricalOrders } from "../../osmosis";

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
      queryHistoricalOrders(userOsmoAddress).then((data) => {
        const orders = data;
        orders.forEach((o) => {
          if (o.status === "cancelled" && o.claimed_quantity !== o.quantity) {
            const newOrder: HistoricalLimitOrder = {
              ...o,
              quantity: o.claimed_quantity,
              status: "fullyClaimed",
            };
            orders.push(newOrder);
          }
        });
        return orders;
      }),
  });
}
