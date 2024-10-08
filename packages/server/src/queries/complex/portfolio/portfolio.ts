import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryPortfolioOverTime } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";

export type Range = "1d" | "7d" | "1mo" | "1y" | "all";

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export interface ChartPortfolioOverTimeResponse {
  time: number;
  value: number;
}

export async function getPortfolioOverTime({
  address,
  range,
}: {
  address: string;
  range: Range;
}): Promise<ChartPortfolioOverTimeResponse[]> {
  return await cachified({
    cache: transactionsCache,
    ttl: 1000 * 60, // 60 seconds
    key: `portfolio-over-time-${address}-range-${range}`,
    getFreshValue: async () => {
      const data = await queryPortfolioOverTime({
        address,
        range,
      });

      // sort data by timestamp in ascending order for chart
      const sortedData = data?.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // map data to time and value for chart
      const mappedData = sortedData.map((d) => ({
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#get_the_number_of_seconds_since_the_ecmascript_epoch
        time: Math.floor(new Date(d.timestamp).getTime() / 1000), // convert to seconds
        value: d.usd,
      }));

      return mappedData;
    },
  });
}
