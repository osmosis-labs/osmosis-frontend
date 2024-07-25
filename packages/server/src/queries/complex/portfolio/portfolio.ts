import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryPortfolioOverTime } from "../../../queries/data-services";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";

export type Range = "1d" | "7d" | "1mo" | "1y" | "all";

const transactionsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export interface ChartPortfolioOverTimeResponse {
  time: string;
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
        time: d.timestamp.split(" ")[0],
        value: d.usd,
      }));

      // potentially remove this for 1h charts
      // merge data with the same date / take an average of values per date
      const chartData = Object.values(
        mappedData?.reduce((acc, d) => {
          if (acc[d.time]) {
            acc[d.time].value = (acc[d.time].value + d.value) / 2;
          } else {
            acc[d.time] = { ...d };
          }
          return acc;
        }, {} as Record<string, ChartPortfolioOverTimeResponse>) || {}
      );

      return chartData;
    },
  });
}
