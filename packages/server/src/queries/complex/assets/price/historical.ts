import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../../utils/cache";
import dayjs from "../../../../utils/dayjs";
import { queryMarketChart } from "../../../coingecko";
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
  coinDenom,
  timeFrame,
  numRecentFrames,
}: {
  /** Major (symbol) denom to fetch historical price data for. */
  coinDenom: string;
  /** Number of minutes per bar. So 60 refers to price every hour. */
  timeFrame: TimeFrame | CommonPriceChartTimeFrame;
  /** How many recent price values to splice with.
   *  For example, with `timeFrameMinutes` set to every hour (60) and `numRecentFrames` set to 24, you get the last day's worth of hourly prices. */
  numRecentFrames?: number;
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
    key: `token-historical-price-${coinDenom}-${timeFrame}-${
      numRecentFrames ?? "all"
    }`,
    ttl: 1000 * 60 * 3, // 3 minutes
    getFreshValue: () =>
      queryTokenHistoricalChart({
        coinDenom,
        timeFrameMinutes: timeFrame as TimeFrame,
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

/** Cached CoinGecko ID for needs of price function. */
export async function getCoinGeckoCoinMarketChart({
  vsCurrency = DEFAULT_VS_CURRENCY.currency,
  timeFrame,
  id,
}: CoinGeckoCoinMarketChartParams) {
  let from: dayjs.Dayjs | undefined = dayjs(new Date());
  const to = dayjs(new Date());

  if (typeof timeFrame === "string") {
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
  }

  const fromTimestamp =
    typeof timeFrame === "string" ? from?.unix() ?? 0 : timeFrame.from;
  const toTimestamp = typeof timeFrame === "string" ? to?.unix() : timeFrame.to;

  return cachified({
    cache: tokenHistoricalPriceCache,
    key: `coingecko-coin-market-chart-${id}-${from?.unix()}-${to.unix()}-${vsCurrency}`,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: async () =>
      queryMarketChart({
        id,
        vsCurrency,
        to: toTimestamp,
        from: fromTimestamp,
      }),
  });
}
