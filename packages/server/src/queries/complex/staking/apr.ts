import { Dec } from "@osmosis-labs/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryStakingApr } from "../../../queries/data-services/staking-apr";
import {
  DATA_SERVICES_APR_MAX_AGE,
  DEFAULT_LRU_OPTIONS,
} from "../../../utils/cache";

const averageStakingAprCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

const STAKING_APR_TTL = 1000 * 60 * 30; // 30 minutes since APR changes once a day at an unkown time

/** Last APR fetched for any date range. The cache key changes at UTC midnight, so a
 *  data-services outage spanning midnight would otherwise lose the stale fallback. */
let lastStakingApr: { apr: Dec; fetchedAt: number } | undefined;

/** Average staking APR over the given dates, from the data services.
 *  Throws when it's unavailable and no APR from the last day is known. */
export async function getAverageStakingApr({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): Promise<Dec> {
  try {
    return await cachified({
      cache: averageStakingAprCache,
      ttl: STAKING_APR_TTL,
      staleWhileRevalidate: DATA_SERVICES_APR_MAX_AGE - STAKING_APR_TTL,
      key: `average-staking-apr-${startDate}-${endDate}`,
      // Errors are thrown, not returned as 0: an unknown APR must not show as 0% or be cached.
      getFreshValue: async () => {
        const data = await queryStakingApr({ startDate, endDate });

        if (data.length === 0) {
          throw new Error("No data returned from Numia for Staking APR");
        }

        const sum = data.reduce((acc, item) => acc + item.apr, 0);
        const apr = new Dec(sum / data.length);
        lastStakingApr = { apr, fetchedAt: Date.now() };
        return apr;
      },
    });
  } catch (e) {
    if (
      lastStakingApr &&
      Date.now() - lastStakingApr.fetchedAt <= DATA_SERVICES_APR_MAX_AGE
    ) {
      return lastStakingApr.apr;
    }
    throw e;
  }
}
