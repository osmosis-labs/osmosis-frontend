import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import { queryPoolsFees } from "../../imperator";
import { DEFAULT_VS_CURRENCY } from "../assets/config";

export type PoolMarketMetrics = Partial<{
  volume7dUsd: PricePretty;
  volume24hUsd: PricePretty;
  volume24hChange: RatePretty;
  feesSpent24hUsd: PricePretty;
  feesSpent7dUsd: PricePretty;
}>;

const metricPoolsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Get a cached Map with pool IDs mapped to market metrics for that pool. */
export function getCachedPoolMarketMetricsMap(): Promise<
  Map<string, PoolMarketMetrics>
> {
  return cachified({
    cache: metricPoolsCache,
    key: "pools-metrics-map",
    ttl: 1000 * 60 * 5, // 5 mins
    staleWhileRevalidate: 1000 * 60 * 10, // 10 minutes
    getFreshValue: async (context) => {
      const map = new Map<string, PoolMarketMetrics>();
      try {
        // append fee revenue data to volume data
        const poolsFees = await queryPoolsFees();
        poolsFees.data.forEach(
          ({
            pool_id,
            volume_24h,
            volume_7d,
            fees_spent_24h,
            fees_spent_7d,
          }) => {
            map.set(pool_id, {
              volume24hUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_24h),
              volume7dUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_7d),
              feesSpent24hUsd: new PricePretty(
                DEFAULT_VS_CURRENCY,
                fees_spent_24h
              ),
              feesSpent7dUsd: new PricePretty(
                DEFAULT_VS_CURRENCY,
                fees_spent_7d
              ),
            });
          }
        );
      } catch (e) {
        // no stale values were available to serve request
        // return an empty map to indicate data isn't available
        if (!context.background) {
          return map;
        }

        // re-throw to indicate that the stale value should be used
        throw e;
      }

      return map;
    },
  });
}
