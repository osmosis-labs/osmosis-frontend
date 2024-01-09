import { Dec, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryPoolAprs } from "../../indexer/pool-aprs";

export type PoolIncentive = { poolId: string } & Partial<{
  aprBreakdown: Partial<{
    total: RatePretty;

    swapFee: RatePretty;
    superfluid: RatePretty;
    osmosis: RatePretty;
    boost: RatePretty;
  }>;
}>;

export async function getIncentivizedPool(poolId: string) {
  const map = await getCachedIncentivizedPools();
  return map.get(poolId);
}

export async function getIncentivizedPools() {
  const map = await getCachedIncentivizedPools();
  return Array.from(map.values());
}

const incentivePoolsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Get a cached Map with pool IDs mapped to market metrics for that pool. */
function getCachedIncentivizedPools(): Promise<Map<string, PoolIncentive>> {
  return cachified({
    cache: incentivePoolsCache,
    key: "pools-with-incentives-map",
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const aprs = await queryPoolAprs();

      return aprs.reduce((map, apr) => {
        map.set(apr.pool_id, {
          poolId: apr.pool_id,
          aprBreakdown: {
            total: maybeMakeRatePretty(apr.total_apr),
            swapFee: maybeMakeRatePretty(apr.swap_fees),
            superfluid: maybeMakeRatePretty(apr.superfluid),
            osmosis: maybeMakeRatePretty(apr.osmosis),
            boost: maybeMakeRatePretty(apr.boost),
          },
        });

        return map;
      }, new Map<string, PoolIncentive>());
    },
  });
}

function maybeMakeRatePretty(value: number): RatePretty | undefined {
  // numia will return 0 if the APR is not applicable, so return undefined to indicate that
  if (value === 0) {
    return undefined;
  }

  return new RatePretty(new Dec(value).quo(new Dec(100)));
}
