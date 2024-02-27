import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified from "cachified";

import { RemoteCache } from "~/utils/cache";

import { queryPoolsFees } from "../../imperator";
import { DEFAULT_VS_CURRENCY } from "../assets/config";

export type PoolMarketMetrics = Partial<{
  volume7dUsd: PricePretty;
  volume24hUsd: PricePretty;
  volume24hChange: RatePretty;
  feesSpent24hUsd: PricePretty;
  feesSpent7dUsd: PricePretty;
}>;

const metricPoolsCache = new RemoteCache();
/** Get a cached Map with pool IDs mapped to market metrics for that pool. */
export function getCachedPoolMarketMetricsMap(): Promise<
  Map<string, PoolMarketMetrics>
> {
  return cachified({
    cache: metricPoolsCache,
    key: "pools-metrics-map",
    ttl: 1000, // 1 min
    staleWhileRevalidate: 1000 * 60, // 1 hour
    getFreshValue: async () => {
      const map = new Map<string, PoolMarketMetrics>();

      // append fee revenue data to volume data
      try {
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
      } catch (err) {
        // Return empty map if it fails
        console.error("Failed to fetch pool metrics", err);
      }

      return map;
    },
  });
}
