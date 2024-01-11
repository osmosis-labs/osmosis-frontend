import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";

import { queryPoolsFees } from "../../imperator";
import { DEFAULT_VS_CURRENCY } from "../assets/config";
import { getPools, Pool, PoolFilter } from "./index";

export type PoolMarketMetrics = Partial<{
  volume7dUsd: PricePretty;
  volume24hUsd: PricePretty;
  volume24hChange: RatePretty;
  feesSpent24hUsd: PricePretty;
  feesSpent7dUsd: PricePretty;
}>;

/** Get metrics for individual pool. */
export async function getPoolMarketMetric(
  poolId: string
): Promise<PoolMarketMetrics | undefined> {
  const poolMetrics = await getCachedPoolMarketMetricsMap();
  return poolMetrics.get(poolId);
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no pools provided, they will be fetched and passed the given search params. */
export async function mapGetPoolMarketMetrics<TPool extends Pool>({
  pools,
  ...params
}: {
  pools?: TPool[];
} & PoolFilter = {}): Promise<(PoolMarketMetrics & TPool)[]> {
  if (!pools) pools = (await getPools(params)) as TPool[];

  const metrics = await getCachedPoolMarketMetricsMap();

  return pools.map((pool) => ({
    ...pool,
    ...metrics.get(pool.id),
  }));
}

const metricPoolsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Get a cached Map with pool IDs mapped to market metrics for that pool. */
function getCachedPoolMarketMetricsMap(): Promise<
  Map<string, PoolMarketMetrics>
> {
  return cachified({
    cache: metricPoolsCache,
    key: "pools-metrics-map",
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const map = new Map<string, PoolMarketMetrics>();

      // append fee revenue data to volume data
      const poolsFees = await queryPoolsFees();
      poolsFees.data.forEach(
        ({ pool_id, volume_24h, volume_7d, fees_spent_24h, fees_spent_7d }) => {
          map.set(pool_id, {
            volume24hUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_24h),
            volume7dUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_7d),
            feesSpent24hUsd: new PricePretty(
              DEFAULT_VS_CURRENCY,
              fees_spent_24h
            ),
            feesSpent7dUsd: new PricePretty(DEFAULT_VS_CURRENCY, fees_spent_7d),
          });
        }
      );

      return map;
    },
  });
}
