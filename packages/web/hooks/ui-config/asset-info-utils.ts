import type { TokenHistoricalPrice } from "@osmosis-labs/server";
import dayjs from "dayjs";

import type { RouterOutputs } from "~/utils/trpc";

export const AvailablePriceRanges = {
  "1h": "1h",
  "1d": "1d",
  "7d": "7d",
  "1mo": "1mo",
  "1y": "1y",
  all: "all",
} as const;

export type PriceRange =
  (typeof AvailablePriceRanges)[keyof typeof AvailablePriceRanges];

export const AssetChartAvailableDataTypes = ["price", "volume"] as const;

export type AssetChartDataType = (typeof AssetChartAvailableDataTypes)[number];

export const AssetChartModes = {
  advanced: "advanced",
  simple: "simple",
} as const;

export type AssetChartMode =
  (typeof AssetChartModes)[keyof typeof AssetChartModes];

export interface ChartTick {
  time: number;
  close: number;
}

export type CoingeckoHistoricalPrices =
  RouterOutputs["edge"]["assets"]["getCoingeckoAssetHistoricalPrice"];

const DEFAULT_STALE_THRESHOLD_MS = 60 * 60 * 1000;
const STALE_THRESHOLD_MS_BY_RANGE: Partial<Record<PriceRange, number>> = {
  "1h": 15 * 60 * 1000,
};

/** Bucket size (minutes) and number of recent buckets per range and data type. */
export function getCustomTimeFrame(
  range: PriceRange,
  dataType: AssetChartDataType
): { timeFrame: number; numRecentFrames: number | undefined } {
  let frame = 60;
  let numRecentFrames: number | undefined = undefined;

  switch (range) {
    case "1h":
      frame = 5;
      numRecentFrames = 14;
      break;
    case "1d":
      frame = 15;
      numRecentFrames = 97;
      break;
    case "7d":
      frame = dataType === "price" ? 60 : 720;
      numRecentFrames = dataType === "price" ? 168 : 15;
      break;
    case "1mo":
      frame = dataType === "price" ? 240 : 1440;
      numRecentFrames = dataType === "price" ? 180 : 30;
      break;
    case "1y":
      frame = dataType === "price" ? 1440 : 10080;
      numRecentFrames = dataType === "price" ? 365 : 54;
      break;
    case "all":
      frame = dataType === "price" ? 10080 : 43800;
      break;
  }

  return { timeFrame: frame, numRecentFrames };
}

/** Converts CoinGecko prices to chart points within the selected range. */
export function toCoingeckoHistoricalData(
  data: CoingeckoHistoricalPrices,
  historicalRange: PriceRange,
  nowMs: number = Date.now()
): TokenHistoricalPrice[] | undefined {
  const historicalData = data?.prices.map(([timestamp, price]) => ({
    time: timestamp / 1000,
    close: price,
    high: price,
    low: price,
    open: price,
    volume: 0,
  }));

  if (historicalRange === "all") {
    return historicalData;
  }

  let min = dayjs(nowMs);
  const maxTime = dayjs(nowMs).unix();

  switch (historicalRange) {
    case "1h":
      min = min.subtract(1, "hour");
      break;
    case "1d":
      min = min.subtract(1, "day");
      break;
    case "7d":
      min = min.subtract(1, "week");
      break;
    case "1mo":
      min = min.subtract(1, "month");
      break;
    case "1y":
      min = min.subtract(1, "year");
      break;
  }

  const minTime = min.unix();

  return historicalData?.filter(
    (price) => price.time <= maxTime && price.time >= minTime
  );
}

/** Drops points timestamped in the future. */
export function filterFutureData(
  data: TokenHistoricalPrice[],
  nowMs: number
): TokenHistoricalPrice[] {
  return data.filter((point) => point.time * 1000 <= nowMs);
}

export function isHistoricalChartStale({
  isLoading,
  isUnavailable,
  usingCoingeckoFallback,
  latestPricePointTimeSec,
  range,
  nowMs,
}: {
  isLoading: boolean;
  isUnavailable: boolean;
  usingCoingeckoFallback: boolean;
  latestPricePointTimeSec: number | undefined;
  range: PriceRange;
  nowMs: number;
}): boolean {
  if (isLoading || isUnavailable) return false;
  // The latest-price-point query is an on-chain cascade. When the chart
  // is rendering CoinGecko data (on-chain history was empty for the
  // range), an old on-chain timestamp is not meaningful for what the
  // user is looking at, so suppress the pill in that case.
  if (usingCoingeckoFallback) return false;
  if (latestPricePointTimeSec === undefined) return false;
  const threshold =
    STALE_THRESHOLD_MS_BY_RANGE[range] ?? DEFAULT_STALE_THRESHOLD_MS;
  return nowMs - latestPricePointTimeSec * 1000 > threshold;
}
