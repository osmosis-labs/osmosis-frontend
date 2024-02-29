import { CoinPretty, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { makeStaticPoolFromRaw, PoolRaw } from "@osmosis-labs/pools";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList, isNil } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { AssetLists } from "~/config/generated/asset-lists";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "~/server/queries/coingecko";
import { queryPaginatedPools } from "~/server/queries/complex/pools/providers/imperator";
import { DEFAULT_LRU_OPTIONS, LARGE_LRU_OPTIONS } from "~/utils/cache";

import { EdgeDataLoader } from "../../base-utils";
import {
  queryTokenHistoricalChart,
  queryTokenPairHistoricalChart,
  TimeDuration,
  TimeFrame,
  TokenHistoricalPrice,
  TokenPairHistoricalPrice,
} from "../../imperator";
import { getAsset } from ".";

const pricesCache = new LRUCache<string, CacheEntry>(LARGE_LRU_OPTIONS);

/** Cached CoinGecko ID for needs of price function. */
async function searchCoinGeckoCoinId({ symbol }: { symbol: string }) {
  return cachified({
    cache: pricesCache,
    key: `coingecko-coin-${symbol}`,
    ttl: 1000 * 60 * 60, // 1 hour since the coin api ID won't change often
    staleWhileRevalidate: 1000 * 60 * 60 * 1.5, // 1.5 hours
    getFreshValue: async () =>
      queryCoingeckoSearch(symbol).then(
        ({ coins }) =>
          coins?.find(
            ({ symbol: symbol_ }) =>
              symbol_?.toLowerCase() === symbol.toLowerCase()
          )?.api_symbol
      ),
  });
}

/** Used with `DataLoader` to make batched calls to CoinGecko.
 *  This allows us to provide IDs in a batch to CoinGecko, which is more efficient than making individual calls. */
async function batchFetchCoingeckoPrices(
  coinGeckoIds: readonly string[],
  currency: CoingeckoVsCurrencies
) {
  const pricesObject = await querySimplePrice(coinGeckoIds as string[], [
    currency,
  ]);
  return coinGeckoIds.map(
    (key) =>
      pricesObject[key][currency] ??
      new Error(`No CoinGecko price result for ${key} and ${currency}`)
  );
}
async function getCoingeckoPrice({
  coinGeckoId,
  currency,
}: {
  coinGeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  // Create a loader per given currency.
  const currencyBatchLoader = await cachified({
    cache: pricesCache,
    key: `prices-batch-loader-${currency}`,
    getFreshValue: async () => {
      return new EdgeDataLoader((ids: readonly string[]) =>
        batchFetchCoingeckoPrices(ids, currency)
      );
    },
  });

  // Cache a result per CoinGecko ID *and* currency ID.
  return cachified({
    cache: pricesCache,
    key: `coingecko-price-${coinGeckoId}-${currency}`,
    ttl: 1000 * 60, // 1 minute
    staleWhileRevalidate: 1000 * 60 * 2, // 2 minutes
    getFreshValue: () =>
      currencyBatchLoader.load(coinGeckoId).then((price) => new Dec(price)),
  });
}

/**
 * Calculates the price of a pool price info.
 *
 * To calculate the price it:
 * 1. Finds the pool price route
 * 2. Gets the spot price of the pool
 * 3. Calculated the price of the destination coin recursively (i.e. usd-coin or another pool like uosmo)
 *
 * Note: For now only "usd" is supported.
 *
 * @throws If the asset is not found in the asset list registry or the asset's price info is not found.
 */
async function calculatePriceThroughPools({
  asset,
  currency,
}: {
  asset: Pick<Asset, "coinMinimalDenom" | "price" | "coingeckoId">;
  currency: "usd";
}): Promise<Dec | undefined> {
  if (!asset.price && !asset.coingeckoId)
    throw new Error(
      "No price info or coingecko id for " + asset.coinMinimalDenom
    );

  /**
   * Fetch directly from coingecko if there's no price info.
   */
  if (!asset.price && asset.coingeckoId) {
    return await getCoingeckoPrice({
      coinGeckoId: asset.coingeckoId,
      currency,
    });
  }

  if (!asset.price)
    throw new Error("No price info for " + asset.coinMinimalDenom);

  const poolPriceRoute = {
    destCoinMinimalDenom: asset.price.denom,
    poolId: asset.price.poolId,
    sourceCoinMinimalDenom: asset.coinMinimalDenom,
  };

  if (!poolPriceRoute)
    throw new Error("No pool price route for " + asset.coinMinimalDenom);

  const tokenInIbc = poolPriceRoute.sourceCoinMinimalDenom;
  const tokenOutIbc = poolPriceRoute.destCoinMinimalDenom;

  const tokenInAsset = getAssetFromAssetList({
    coinMinimalDenom: poolPriceRoute.sourceCoinMinimalDenom,
    assetLists: AssetLists,
  });

  const tokenOutAsset = getAssetFromAssetList({
    coinMinimalDenom: poolPriceRoute.destCoinMinimalDenom,
    assetLists: AssetLists,
  });

  if (!tokenInAsset)
    throw new Error(
      poolPriceRoute.sourceCoinMinimalDenom +
        " price source coin not in asset list."
    );

  if (!tokenOutAsset)
    throw new Error(
      poolPriceRoute.destCoinMinimalDenom +
        " price dest coin not in asset list."
    );

  const rawPool: PoolRaw = (
    await queryPaginatedPools({
      poolId: poolPriceRoute.poolId,
    })
  )?.pools[0];

  if (!rawPool)
    throw new Error(
      "Pool " + poolPriceRoute.poolId + " not found for calculating price."
    );

  const pool = makeStaticPoolFromRaw(rawPool);

  if (isNil(tokenOutAsset.decimals) || isNil(tokenInAsset.decimals))
    throw new Error(
      "Invalid decimals in " +
        tokenOutAsset.symbol +
        " or " +
        tokenInAsset.symbol
    );

  const multiplication = DecUtils.getTenExponentN(
    tokenOutAsset.decimals - tokenInAsset.decimals
  );

  // TODO: get spot price from token amounts instead
  // of instantiating pool models with client
  // side simulation logic.
  const inSpotPrice = new IntPretty(
    pool
      .getSpotPriceInOverOutWithoutSwapFee(tokenInIbc, tokenOutIbc)
      .mulTruncate(multiplication)
  );

  const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0))
    ? new Dec(0)
    : new Dec(1).quo(inSpotPrice.toDec());

  const destCoinPrice = await calculatePriceThroughPools({
    asset: tokenOutAsset.rawAsset,
    currency,
  });

  if (!destCoinPrice)
    throw new Error(
      "No destination coin price found for " + tokenOutAsset.symbol
    );

  return spotPriceDec.mul(destCoinPrice);
}

/** Finds the fiat value of a single unit of a given asset for a given fiat currency.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found.
 */
export async function getAssetPrice({
  asset,
  currency = "usd",
}: {
  asset: Partial<{
    coinDenom: string;
    coinMinimalDenom: string;
    sourceDenom: string;
  }>;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec | undefined> {
  return cachified({
    key: `asset-price-${asset.coinDenom}-${asset.coinMinimalDenom}-${asset.sourceDenom}-${currency}`,
    cache: pricesCache,
    ttl: 1000 * 5, // 5 seconds
    staleWhileRevalidate: 1000 * 10, // 10 seconds
    getFreshValue: async () => {
      const assetListAsset = getAssetFromAssetList({
        sourceDenom: asset.sourceDenom,
        coinMinimalDenom: asset.coinMinimalDenom,
        assetLists: AssetLists,
      });

      if (!assetListAsset) {
        throw new Error(
          `Asset ${asset.sourceDenom} not found on asset list registry.`
        );
      }

      if (assetListAsset.priceInfo && assetListAsset) {
        return await calculatePriceThroughPools({
          asset: assetListAsset.rawAsset,
          currency,
        });
      }

      let coinGeckoId = assetListAsset.coinGeckoId;

      // Try to search CoinGecko for it's ID if it wasn't in asset list
      // This is especially applicable in the bridge providers for calculating quotes
      if (!coinGeckoId) {
        coinGeckoId = await searchCoinGeckoCoinId(assetListAsset);
      }

      if (!coinGeckoId) {
        throw new Error(
          `Asset ${assetListAsset.symbol} has no identifier for pricing.`
        );
      }

      return await getCoingeckoPrice({
        coinGeckoId,
        currency,
      });
    },
  });
}

export function calcCoinValue(coin: CoinPretty) {
  return calcAssetValue({
    anyDenom: coin.currency.coinMinimalDenom,
    amount: coin.toCoin().amount,
  });
}

/** Calculates the fiat value of an asset given any denom and base amount.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found. */
export async function calcAssetValue({
  anyDenom,
  amount,
  currency = "usd",
}: {
  anyDenom: string;
  amount: Int | Dec | string;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec | undefined> {
  const asset = await getAsset({ anyDenom });

  const price = await getAssetPrice({
    asset,
    currency,
  });

  if (!price) throw new Error(anyDenom + " price not available");

  const tokenDivision = DecUtils.getTenExponentN(asset.coinDecimals);

  if (typeof amount === "string") amount = new Int(amount);

  return (amount instanceof Dec ? amount : amount.toDec())
    .quo(tokenDivision)
    .mul(price);
}

export function calcSumCoinsValue(coins: CoinPretty[]) {
  return calcSumAssetsValue({
    assets: coins
      .map((coin) => coin.toCoin())
      .map((coin) => ({ anyDenom: coin.denom, amount: coin.amount })),
  });
}

/** Calculate and sum the value of multiple assets.
 *  Will only include listed assets as part of sum. */
export async function calcSumAssetsValue({
  assets,
  currency = "usd",
}: {
  assets: {
    anyDenom: string;
    amount: Int | string;
  }[];
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec | undefined> {
  return (
    (
      await Promise.all(
        assets.map(async (asset) => {
          const price = await calcAssetValue({
            ...asset,
            currency,
          });

          if (!price) return undefined;

          return price;
        })
      )
    ).filter(Boolean) as NonNullable<
      Awaited<ReturnType<typeof calcAssetValue>>
    >[]
  ).reduce((acc, price) => acc.add(price), new Dec(0));
}

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
    staleWhileRevalidate: 1000 * 60 * 6, // 6 minutes
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
    staleWhileRevalidate: 1000 * 60 * 6, // 6 minutes
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
