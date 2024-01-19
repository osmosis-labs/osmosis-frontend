import { Dec } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { queryStakingApr } from "~/server/queries/numia/staking-apr";

const averageStakingAprCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
/** Gets the numerical market cap rank given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */
export async function getAverageStakingApr({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): Promise<Dec> {
  return await cachified({
    cache: averageStakingAprCache,
    ttl: 1000 * 60 * 60, // 60 minutes since APR changes once a day at an unkown time
    key: `average-staking-apr-${startDate}-${endDate}`,
    getFreshValue: async () => {
      try {
        const data = await queryStakingApr({ startDate, endDate });

        console.log("data", data);

        if (data.length === 0) {
          throw new Error("No data returned from Numia for Staking APR");
        }

        const sum = data.reduce((acc, item) => acc + item.apr, 0);
        const average = sum / data.length;
        return new Dec(average);
      } catch {
        return new Dec(0);
      }
    },
  });
}
