import { PricePretty, RatePretty } from "@osmosis-labs/unit";
import { Dec } from "@osmosis-labs/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryPortfolioOverTime } from "../../data-services";

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

type Nominal<T, Name extends string> = T & {
  /** The 'name' or species of the nominal. */
  [Symbol.species]: Name;
};

export const calculatePortfolioPerformance = (
  data: ChartPortfolioOverTimeResponse[] | undefined,
  dataPoint: {
    value?: number;
    time?:
      | Nominal<number, "UTCTimestamp">
      | {
          year: number;
          month: number;
          day: number;
        }
      | string
      | number;
  }
): {
  selectedPercentageRatePretty: RatePretty;
  selectedDifferencePricePretty: PricePretty;
  totalPriceChange: number;
} => {
  if (!data) {
    return {
      selectedPercentageRatePretty: new RatePretty(new Dec(0)),
      selectedDifferencePricePretty: new PricePretty(
        DEFAULT_VS_CURRENCY,
        new Dec(0)
      ),
      totalPriceChange: 0,
    };
  }

  // Check if all values are 0, for instance if a user created a new wallet and has no transactions
  const hasAllZeroValues = data?.every((point) => point.value === 0);
  if (
    hasAllZeroValues &&
    (dataPoint?.value === 0 || dataPoint?.value === undefined)
  ) {
    return {
      selectedPercentageRatePretty: new RatePretty(new Dec(0)),
      selectedDifferencePricePretty: new PricePretty(
        DEFAULT_VS_CURRENCY,
        new Dec(0)
      ),
      totalPriceChange: 0,
    };
  }

  const openingPrice = data?.[0]?.value;
  const openingPriceWithFallback = !openingPrice ? 1 : openingPrice; // handle first value being 0 or undefined
  const selectedDifference = (dataPoint?.value ?? 0) - openingPriceWithFallback;
  const selectedPercentage = selectedDifference / openingPriceWithFallback;
  const selectedPercentageRatePretty = new RatePretty(
    new Dec(selectedPercentage)
  );

  const selectedDifferencePricePretty = new PricePretty(
    DEFAULT_VS_CURRENCY,
    new Dec(selectedDifference)
  );

  const closingPrice = data?.[data.length - 1]?.value;
  const closingPriceWithFallback = !closingPrice ? 1 : closingPrice; // handle last value being 0 or undefined

  const totalPriceChange = closingPriceWithFallback - openingPriceWithFallback;

  return {
    selectedPercentageRatePretty,
    selectedDifferencePricePretty,
    totalPriceChange,
  };
};
