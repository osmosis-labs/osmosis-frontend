import { Dec, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryPoolAprs } from "../../numia/pool-aprs";
import { getPools, Pool, PoolFilter } from "./index";

export type PoolIncentives = Partial<{
  aprBreakdown: Partial<{
    total: RatePretty;

    swapFee: RatePretty;
    superfluid: RatePretty;
    osmosis: RatePretty;
    boost: RatePretty;
  }>;
}>;

export async function getPoolIncentives(poolId: string) {
  const map = await getCachedPoolIncentivesMap();
  return map.get(poolId);
}

/** Fetches pools with given filter params if pools are not provided,
 *  and merges pool incentive info with the given pool type. */
export async function mapGetPoolIncentives<TPool extends Pool>({
  pools,
  ...params
}: {
  pools?: TPool[];
} & PoolFilter = {}): Promise<(PoolIncentives & TPool)[]> {
  if (!pools) pools = (await getPools(params)) as TPool[];

  const incentives = await getCachedPoolIncentivesMap();

  return pools.map((pool) => ({
    ...pool,
    ...incentives.get(pool.id),
  }));
}

const incentivePoolsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Get a cached Map with pool IDs mapped to incentives for that pool. */
async function getCachedPoolIncentivesMap(): Promise<
  Map<string, PoolIncentives>
> {
  return cachified({
    cache: incentivePoolsCache,
    key: "pools-incentives-map",
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const aprs = await queryPoolAprs();

      return aprs.reduce((map, apr) => {
        map.set(apr.pool_id, {
          aprBreakdown: {
            total: maybeMakeRatePretty(apr.total_apr),
            swapFee: maybeMakeRatePretty(apr.swap_fees),
            superfluid: maybeMakeRatePretty(apr.superfluid),
            osmosis: maybeMakeRatePretty(apr.osmosis),
            boost: maybeMakeRatePretty(apr.boost),
          },
        });

        return map;
      }, new Map<string, PoolIncentives>());
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
