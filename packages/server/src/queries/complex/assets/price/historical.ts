import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  DATA_SERVICES_MARKET_MAX_AGE,
  DEFAULT_LRU_OPTIONS,
} from "../../../../utils/cache";
import { dayjs } from "../../../../utils/dayjs";
import { queryMarketChart, QueryMarketChartResponse } from "../../../coingecko";
import {
  queryTokenHistoricalChart,
  queryTokenPairHistoricalChart,
  TimeDuration,
  TimeFrame,
  TokenHistoricalPrice,
  TokenPairHistoricalPrice,
} from "../../../data-services";
import { DEFAULT_VS_CURRENCY } from "../config";

const tokenHistoricalPriceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
export type CommonPriceChartTimeFrame = "1H" | "1D" | "1W" | "1M";
/** Cached query function for getting an asset's historical price for a given token and time frame.
 *
 *  If passed a string of type `CommonPriceChartTimeFrame` for `timeFrame`:
 *  It get's recent historical price data given common time frame literals.
 *  The configurations for each time frame are as follows:
 *
 *  - "1H": 5-minute bars, last hour of prices (12 recent frames)
 *  - "1D": 1-hour bars, last day of prices (24 recent frames)
 *  - "1W": 12-hour bars, last week of prices (14 recent frames)
 *  - "1M": 1-day bars, last month of prices (30 recent frames */
export function getAssetHistoricalPrice({
  coinMinimalDenom,
  timeFrame,
  numRecentFrames,
  realtime = false,
}: {
  /**
   * Major (symbol) denom to fetch historical price data for.
   *
   * Note: this can be both a symbol or a denom (coinMinimalDenom)
   * */
  coinMinimalDenom: string;
  /** Number of minutes per bar. So 60 refers to price every hour. */
  timeFrame: TimeFrame | CommonPriceChartTimeFrame;
  /** How many recent price values to splice with.
   *  For example, with `timeFrameMinutes` set to every hour (60) and
   * `numRecentFrames` set to 24, you get the last day's worth of hourly prices. */
  numRecentFrames?: number;
  /** Whether to fetch real-time data with 3 seconds caching */
  realtime?: boolean;
}): Promise<TokenHistoricalPrice[]> {
  if (typeof timeFrame === "string") {
    if (timeFrame === "1H") {
      timeFrame = 5; // 5 minute bars
      numRecentFrames = 12; // Last hour of prices in 5 bars of minutes
    } else if (timeFrame === "1D") {
      timeFrame = 60; // 1 hour bars
      numRecentFrames = 24; // Last day of prices with bars of 60 minutes
    } else if (timeFrame === "1W") {
      timeFrame = 720; // 12 hour bars
      numRecentFrames = 14; // Last week of prices with bars of 12 hours
    } else if (timeFrame === "1M") {
      timeFrame = 1440; // 1 day bars
      numRecentFrames = 30; // Last month of prices with bars as 1 day
    } else {
      throw new Error("Invalid time frame");
    }
  }

  return cachified({
    cache: tokenHistoricalPriceCache,
    key: `token-historical-price-${coinMinimalDenom}-${timeFrame}-${
      numRecentFrames ?? "all"
    }-${realtime}`,
    ttl: realtime ? 1000 * 3 : 1000 * 60 * 3, // 3 seconds for realtime, 3 minutes for non-realtime
    staleWhileRevalidate: realtime
      ? 0
      : DATA_SERVICES_MARKET_MAX_AGE - 1000 * 60 * 3,
    getFreshValue: () =>
      queryTokenHistoricalChart({
        coinMinimalDenom,
        timeFrameMinutes: timeFrame as TimeFrame,
        realtime,
      }).then((prices) =>
        numRecentFrames ? prices.slice(-numRecentFrames) : prices
      ),
  });
}

const tokenPairPriceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
/** Gets the relative price of two tokens in a specified pool over a given duration.
 *  Lightly cached. */
export function getPoolAssetPairHistoricalPrice({
  poolId,
  quoteCoinMinimalDenom,
  baseCoinMinimalDenom,
  timeDuration,
}: {
  poolId: string;
  quoteCoinMinimalDenom: string;
  baseCoinMinimalDenom: string;
  timeDuration: TimeDuration;
}): Promise<{ prices: TokenPairHistoricalPrice[]; min: number; max: number }> {
  return cachified({
    cache: tokenPairPriceCache,
    key: `token-pair-historical-price-${poolId}-${quoteCoinMinimalDenom}-${baseCoinMinimalDenom}-${timeDuration}`,
    ttl: 1000 * 60 * 3, // 3 minutes
    staleWhileRevalidate: DATA_SERVICES_MARKET_MAX_AGE - 1000 * 60 * 3,
    getFreshValue: () =>
      queryTokenPairHistoricalChart(
        poolId,
        quoteCoinMinimalDenom,
        baseCoinMinimalDenom,
        timeDuration
      ).then((prices) => ({
        prices: prices.map((price) => ({
          ...price,
          time: price.time * 1000,
        })),
        min: Math.min(...prices.map((price) => price.close)),
        max: Math.max(...prices.map((price) => price.close)),
      })),
  });
}

type CoinGeckoCoinMarketChartParams = {
  id: string;
  timeFrame:
    | string
    | {
        from: number;
        to: number;
      };
  vsCurrency?: string;
};

const MINUTE_S = 60;
const HOUR_S = 60 * MINUTE_S;
const DAY_S = 24 * HOUR_S;

/** Width of the bucket the range is rounded to, scaled to the span of the chart
 *  (CoinGecko's own data granularity is 5 minutes up to 1 day, hourly up to 90 days,
 *  daily beyond). */
function getMarketChartBucketSeconds(spanSeconds: number) {
  if (spanSeconds <= DAY_S) return 5 * MINUTE_S;
  if (spanSeconds <= 90 * DAY_S) return HOUR_S;
  return DAY_S;
}

/** Rounds a market chart range to a bucket so that requests made within the same bucket
 *  are identical (same URL and cache key). `to` is rounded up, so the latest data point
 *  is never cut off (CoinGecko accepts an end in the future), and `from` is derived from
 *  it so the span is preserved: widening it could cross CoinGecko's granularity boundary
 *  (e.g. a 1 day range turning hourly instead of 5 minute). */
export function roundMarketChartRange({
  from,
  to,
}: {
  /** Unix timestamp in seconds. */
  from: number;
  /** Unix timestamp in seconds. */
  to: number;
}) {
  const span = to - from;
  const bucket = getMarketChartBucketSeconds(span);
  const roundedTo = Math.ceil(to / bucket) * bucket;
  return { from: roundedTo - span, to: roundedTo };
}

/** Cached CoinGecko ID for needs of price function. */
export async function getCoinGeckoCoinMarketChart({
  vsCurrency = DEFAULT_VS_CURRENCY.currency,
  timeFrame,
  id,
}: CoinGeckoCoinMarketChartParams) {
  let fromTimestamp: number;
  let toTimestamp: number;

  if (typeof timeFrame === "string") {
    const now = dayjs(new Date());
    let from: dayjs.Dayjs | undefined = now;

    /**
     * We set the range of data to be displayed by type
     */
    switch (timeFrame) {
      case "1h":
        from = from.subtract(1, "hour");
        break;
      case "1d":
        from = from.subtract(1, "day");
        break;
      case "7d":
        from = from.subtract(1, "week");
        break;
      case "1mo":
        from = from.subtract(1, "month");
        break;
      case "1y":
        from = from.subtract(1, "year");
        break;
      case "all":
        from = undefined;
        break;
    }

    const range = roundMarketChartRange({
      from: from?.unix() ?? 0,
      to: now.unix(),
    });
    // "all" always starts at 0, whatever the rounded end
    fromTimestamp = timeFrame === "all" ? 0 : range.from;
    toTimestamp = range.to;
  } else {
    // explicit bounds are used as given, shifting them would drop the start of the range
    fromTimestamp = timeFrame.from;
    toTimestamp = timeFrame.to;
  }

  return cachified({
    cache: tokenHistoricalPriceCache,
    key: `coingecko-coin-market-chart-${id}-${fromTimestamp}-${toTimestamp}-${vsCurrency}`,
    // 5 minutes, the width of the shortest bucket, so the latest point is never much older
    ttl: 1000 * 60 * 5,
    getFreshValue: async () => {
      const result = await queryMarketChart({
        id,
        vsCurrency,
        to: toTimestamp,
        from: fromTimestamp,
      });
      // An empty chart is not cached, so it doesn't outlive CoinGecko recovering
      // (the CDN skips caching it for the same reason). The result rides on the error
      // because cachified hands that same error to concurrent callers of this key.
      if (!result?.prices?.length) {
        throw Object.assign(
          new Error(`Empty CoinGecko market chart for ${id}`),
          { emptyMarketChart: result }
        );
      }
      return result;
    },
  }).catch((e: { emptyMarketChart?: QueryMarketChartResponse }) => {
    if (e?.emptyMarketChart) return e.emptyMarketChart;
    throw e;
  });
}
