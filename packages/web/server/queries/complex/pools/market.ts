import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryFilteredPools, queryPoolsFees } from "../../imperator";
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
  return getCachedPoolsWithMetricsMap().then((map) => map.get(poolId));
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetPoolMarketMetrics<TPool extends Pool>({
  pools,
  params,
}: {
  pools?: TPool[];
  params?: PoolFilter;
} = {}): Promise<(PoolMarketMetrics & TPool)[]> {
  if (!pools) pools = (await getPools(params)) as TPool[];

  const metrics = await getCachedPoolsWithMetricsMap();

  return pools.map((pool) => {
    const poolMetrics = metrics.get(pool.id);

    return {
      ...pool,
      ...poolMetrics,
    };
  });
}

const metricPoolsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Get a cached Map with pool IDs mapped to market metrics for that pool. */
function getCachedPoolsWithMetricsMap(): Promise<
  Map<string, PoolMarketMetrics>
> {
  return cachified({
    cache: metricPoolsCache,
    key: "pools-with-metrics-map",
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const { pools } = await queryFilteredPools({
        min_liquidity: 0,
      });
      const poolsFees = await queryPoolsFees();
      const map = new Map<string, PoolMarketMetrics>();
      pools.forEach(({ pool_id, volume_24h, volume_7d, volume_24h_change }) => {
        const { fees_spent_24h, fees_spent_7d } = poolsFees?.data.find(
          ({ pool_id }) => pool_id === pool_id
        ) ?? { fees_spent_24h: undefined, fees_spent_7d: undefined };

        map.set(pool_id.toString(), {
          volume24hUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_24h),
          volume7dUsd: new PricePretty(DEFAULT_VS_CURRENCY, volume_7d),
          volume24hChange: new RatePretty(volume_24h_change),
          feesSpent24hUsd: fees_spent_24h
            ? new PricePretty(DEFAULT_VS_CURRENCY, fees_spent_24h)
            : undefined,
          feesSpent7dUsd: fees_spent_7d
            ? new PricePretty(DEFAULT_VS_CURRENCY, fees_spent_7d)
            : undefined,
        });
      });
      return map;
    },
  });
}
