import { Dec } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";

import { queryStakingApr } from "../../numia/inflation";

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
    key: "average-staking-apr" + startDate + endDate,
    getFreshValue: async () => {
      try {
        const data = await queryStakingApr({ startDate, endDate });

        if (data.length === 0) return new Dec(0);

        const sum = data.reduce((acc, item) => acc + item.apr, 0);
        const average = sum / data.length;
        return new Dec(average);
      } catch {
        // ignore error and return undefined, since market cap rank is non-critical
        // TODO handle this error
        return new Dec(0);
      }
    },
  });
}
