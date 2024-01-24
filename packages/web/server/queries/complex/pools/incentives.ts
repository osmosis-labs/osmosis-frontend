import { Dec, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { queryPriceRangeApr } from "~/server/queries/imperator";
import { queryLockableDurations } from "~/server/queries/osmosis";

import { queryPoolAprs } from "../../numia/pool-aprs";
import { getPools, Pool, PoolFilter } from "./index";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const allPoolIncentiveTypes = [
  "superfluid",
  "osmosis",
  "boost",
  "none",
] as const;
export type PoolIncentiveType = (typeof allPoolIncentiveTypes)[number];

export type PoolIncentives = Partial<{
  aprBreakdown: Partial<{
    total: RatePretty;

    swapFee: RatePretty;
    superfluid: RatePretty;
    osmosis: RatePretty;
    boost: RatePretty;
  }>;
  incentiveTypes?: PoolIncentiveType[];
}>;

export const IncentivePoolFilterSchema = z.object({
  /** Only include pools of given incentive types.s */
  incentiveTypes: z.array(z.enum(allPoolIncentiveTypes)).optional(),
});

/** Params for filtering pools. */
export type IncentivePoolFilter = z.infer<typeof IncentivePoolFilterSchema>;

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
} & PoolFilter &
  IncentivePoolFilter = {}): Promise<(PoolIncentives & TPool)[]> {
  if (!pools) pools = (await getPools(params)) as TPool[];

  const incentives = await getCachedPoolIncentivesMap();

  return pools
    .map((pool) => {
      const poolIncentive = incentives.get(pool.id);

      // Filter pools if incentive types are specified.
      // Any type in the given list of types has to be included at least once in the pool types.
      if (params.incentiveTypes && poolIncentive) {
        const hasIncentiveType = params.incentiveTypes.some((type) =>
          poolIncentive.incentiveTypes?.includes(type)
        );
        if (!hasIncentiveType) return;
      } else if (
        params.incentiveTypes &&
        !poolIncentive &&
        !params.incentiveTypes.includes("none")
      ) {
        // "none" is a special case, where it includes pools that
        // don't have an incentives of any type, where the pool incentives map
        // returns nothing for that pool.
        // Though, if numia indexes swap fee rewards, none will be filtered above.
        return;
      }

      return {
        ...pool,
        ...poolIncentive,
      };
    })
    .filter(Boolean) as (PoolIncentives & TPool)[];
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
        const total = maybeMakeRatePretty(apr.total_apr);
        const swapFee = maybeMakeRatePretty(apr.swap_fees);
        const superfluid = maybeMakeRatePretty(apr.superfluid);
        const osmosis = maybeMakeRatePretty(apr.osmosis);
        const boost = maybeMakeRatePretty(apr.boost);

        // add list of incentives that are defined
        const incentiveTypes: PoolIncentiveType[] = [];
        if (superfluid) incentiveTypes.push("superfluid");
        if (osmosis) incentiveTypes.push("osmosis");
        if (boost) incentiveTypes.push("boost");
        if (!superfluid && !osmosis && !boost) incentiveTypes.push("none");
        const hasBreakdownData =
          total || swapFee || superfluid || osmosis || boost;

        map.set(apr.pool_id, {
          aprBreakdown: hasBreakdownData
            ? {
                total,
                swapFee,
                superfluid,
                osmosis,
                boost,
              }
            : undefined,
          incentiveTypes,
        });

        return map;
      }, new Map<string, PoolIncentives>());
    },
  });
}

const aprCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getConcentratedRangePoolApr({
  poolId,
  upperTick,
  lowerTick,
}: {
  poolId: string;
  lowerTick: string;
  upperTick: string;
}): Promise<RatePretty | undefined> {
  return cachified({
    cache: aprCache,
    key: `concentrated-pool-apr-${poolId}-${lowerTick}-${upperTick}`,
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      try {
        const { APR } = await queryPriceRangeApr({
          lowerTickIndex: lowerTick,
          upperTickIndex: upperTick,
          poolId: poolId,
        });
        const apr = APR / 100;
        if (isNaN(apr)) return;
        return new RatePretty(apr);
      } catch {
        return undefined;
      }
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

export function getLockableDurations() {
  return cachified({
    cache: incentivePoolsCache,
    key: "lockable-durations",
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      const { lockable_durations } = await queryLockableDurations();

      return lockable_durations
        .map((durationStr: string) => {
          return dayjs.duration(parseInt(durationStr.replace("s", "")) * 1000);
        })
        .slice()
        .sort((v1, v2) => {
          return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
        });
    },
  });
}
