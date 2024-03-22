import { Dec, RatePretty } from "@keplr-wallet/unit";
import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { LRUCache } from "lru-cache";
import { z } from "zod";

import { EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS } from "../../../env";
import { queryPriceRangeApr } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryPoolAprs } from "../../data-services/pool-aprs";
import { Gauge, queryGauges, queryLockableDurations } from "../../osmosis";
import { Epochs } from "../../osmosis/epochs";
import { queryIncentivizedPools } from "../../osmosis/incentives/incentivized-pools";
import { getEpochs } from "../osmosis";

/**
 * Pools that are excluded from showing external boost incentives APRs.
 */
const ExcludedExternalBoostPools: string[] =
  (EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS ?? []) as string[];

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
  incentiveTypes: PoolIncentiveType[];
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

/** Checks a pool's incentive data againt a given filter to determine if it's filtered out. */
export function isIncentivePoolFiltered(
  incentives: PoolIncentives,
  filter: IncentivePoolFilter
) {
  // Filter pools if incentive types are specified.
  // Any type in the given list of types has to be included at least once in the pool types.
  if (filter.incentiveTypes && incentives) {
    const hasIncentiveType = filter.incentiveTypes.some((type) =>
      incentives.incentiveTypes?.includes(type)
    );
    if (!hasIncentiveType) return true;
  } else if (
    filter.incentiveTypes &&
    !incentives &&
    !filter.incentiveTypes.includes("none")
  ) {
    // "none" is a special case, where it includes pools that
    // don't have an incentives of any type, where the pool incentives map
    // returns nothing for that pool.
    // Though, if numia indexes swap fee rewards, none will be filtered above.
    return true;
  }

  return false;
}

const incentivePoolsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Get a cached Map with pool IDs mapped to incentives for that pool. */
export function getCachedPoolIncentivesMap(): Promise<
  Map<string, PoolIncentives>
> {
  return cachified({
    cache: incentivePoolsCache,
    key: "pools-incentives-map",
    ttl: 1000 * 30, // 30 seconds
    getFreshValue: async () => {
      const aprs = await queryPoolAprs();

      return aprs.reduce((map, apr) => {
        let total = maybeMakeRatePretty(apr.total_apr);
        const swapFee = maybeMakeRatePretty(apr.swap_fees);
        const superfluid = maybeMakeRatePretty(apr.superfluid);
        const osmosis = maybeMakeRatePretty(apr.osmosis);
        let boost = maybeMakeRatePretty(apr.boost);

        // Temporarily exclude pools in this array from showing boost incentives given an issue on chain
        if (
          ExcludedExternalBoostPools.includes(apr.pool_id) &&
          total &&
          boost
        ) {
          total = new RatePretty(total.toDec().sub(boost.toDec()));
          boost = undefined;
        }

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
      const { APR } = await queryPriceRangeApr({
        lowerTickIndex: lowerTick,
        upperTickIndex: upperTick,
        poolId: poolId,
      });
      const apr = APR / 100;
      if (isNaN(apr)) return;
      return new RatePretty(apr);
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

const incentivesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getLockableDurations({ chainList }: { chainList: Chain[] }) {
  return cachified({
    cache: incentivesCache,
    key: "lockable-durations",
    ttl: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      const { lockable_durations } = await queryLockableDurations({
        chainList,
      });

      return lockable_durations
        .map((durationStr: string) => {
          return dayjs.duration(parseInt(durationStr.replace("s", "")) * 1000);
        })
        .sort((v1, v2) => {
          return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
        });
    },
  });
}

/** Gets internally incentivized pools with gauges that distribute minted staking tokens. */
export function getIncentivizedPools({ chainList }: { chainList: Chain[] }) {
  return cachified({
    cache: incentivesCache,
    key: "incentivized-pools",
    ttl: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      const { incentivized_pools } = await queryIncentivizedPools({
        chainList,
      });

      return incentivized_pools.map((pool) => ({
        pool_id: pool.pool_id,
        lockable_duration: dayjs.duration(
          parseInt(pool.lockable_duration.replace("s", "")) * 1000
        ),
        gauge_id: pool.gauge_id,
      }));
    },
  });
}

/** Gets gauges and filters those that are active. */
export function getActiveGauges({ chainList }: { chainList: Chain[] }) {
  return cachified({
    cache: incentivesCache,
    key: "active-external-gauges",
    ttl: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      const { data } = await queryGauges({ chainList });
      const epochs = await getEpochs({ chainList });

      return data
        .filter(
          (gauge) =>
            !gauge.is_perpetual &&
            gauge.distribute_to.denom.startsWith("gamm/pool") && // only gamm share incentives
            !gauge.coins.some((coin) =>
              coin.denom.match(/gamm\/pool\/[0-9]+/m)
            ) && // no gamm share rewards
            gauge.filled_epochs != gauge.num_epochs_paid_over && // no completed gauges
            checkForStaleness(gauge, parseInt(data[data.length - 1].id), epochs)
        )
        .map((gauge) => ({
          ...gauge,
          start_time: new Date(gauge.start_time),
          distribute_to: {
            ...gauge.distribute_to,
            duration: dayjs.duration(
              parseInt(gauge.distribute_to.duration.replace("s", "")) * 1000
            ),
          },
        }));
    },
  });
}

const DURATION_1_DAY = 86400000;
const MAX_NEW_GAUGES_PER_DAY = 100;

function checkForStaleness(
  gauge: Gauge,
  lastGaugeId: number,
  epochs: Epochs["epochs"]
) {
  const parsedGaugeStartTime = Date.parse(gauge.start_time);

  const NOW = Date.now();
  const CURRENT_EPOCH_START_TIME = Date.parse(
    epochs[0].current_epoch_start_time
  );

  return (
    gauge.distributed_coins.length > 0 ||
    (parsedGaugeStartTime > NOW - DURATION_1_DAY &&
      parsedGaugeStartTime < CURRENT_EPOCH_START_TIME + DURATION_1_DAY) ||
    (parsedGaugeStartTime < NOW &&
      parseInt(gauge.id) > lastGaugeId - MAX_NEW_GAUGES_PER_DAY)
  );
}
