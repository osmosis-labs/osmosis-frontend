import { Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { makeStaticPoolFromRaw, PoolRaw } from "@osmosis-labs/pools";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "~/server/queries/coingecko";
import { queryPaginatedPools } from "~/server/queries/complex/pools";

import {
  queryTokenHistoricalChart,
  TimeFrame,
  TokenHistoricalPrice,
} from "../../indexer/token-historical-chart";
import { getAsset } from ".";

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

async function getCoingeckoCoin({ denom }: { denom: string }) {
  return cachified({
    cache: pricesCache,
    key: `coingecko-coin-${denom}`,
    getFreshValue: async () => {
      const { coins } = await queryCoingeckoSearch(denom);
      return coins?.find(
        ({ symbol }) => symbol?.toLowerCase() === denom.toLowerCase()
      );
    },
    ttl: 60 * 1000, // 1 minute
  });
}

async function getCoingeckoPrice({
  coingeckoId,
  currency,
}: {
  coingeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  return cachified({
    cache: pricesCache,
    key: `coingecko-price-${coingeckoId}-${currency}`,
    getFreshValue: async () => {
      const prices = await querySimplePrice([coingeckoId], [currency]);
      const price = prices[coingeckoId]?.[currency];
      return price ? new Dec(price) : undefined;
    },
    ttl: 60 * 1000, // 1 minute
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
 */
async function calculatePriceFromPriceId({
  asset,
  currency,
}: {
  asset: Pick<Asset, "base" | "price_info" | "coingecko_id">;
  currency: "usd";
}): Promise<Dec | undefined> {
  if (!asset) return undefined;
  if (!asset.price_info && !asset.coingecko_id) return undefined;

  /**
   * Fetch directly from coingecko if there's no price info.
   */
  if (!asset.price_info && asset.coingecko_id) {
    return await getCoingeckoPrice({
      coingeckoId: asset.coingecko_id,
      currency,
    });
  }

  if (!asset.price_info) return undefined;

  const poolPriceRoute = {
    destCoinMinimalDenom: asset.price_info.dest_coin_minimal_denom,
    poolId: asset.price_info.pool_id,
    sourceCoinMinimalDenom: asset.base,
  };

  if (!poolPriceRoute) return undefined;

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

  if (!tokenInAsset || !tokenOutAsset) return undefined;

  const rawPool: PoolRaw = (
    await queryPaginatedPools({
      poolId: poolPriceRoute.poolId,
    })
  )?.pools[0];

  if (!rawPool) return undefined;

  const pool = makeStaticPoolFromRaw(rawPool);

  if (!tokenOutAsset.decimals || !tokenInAsset.decimals) return undefined;

  const multiplication = DecUtils.getTenExponentN(
    tokenOutAsset.decimals - tokenInAsset.decimals
  );

  const inSpotPrice = new IntPretty(
    pool
      .getSpotPriceInOverOutWithoutSwapFee(tokenInIbc, tokenOutIbc)
      .mulTruncate(multiplication)
  );

  const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0))
    ? new Dec(0)
    : new Dec(1).quo(inSpotPrice.toDec());

  const destCoinPrice = await calculatePriceFromPriceId({
    asset: tokenOutAsset.rawAsset,
    currency,
  });

  if (!destCoinPrice) return undefined;

  return spotPriceDec.mul(destCoinPrice);
}

/** Finds the fiat value of a single unit of a given asset for a given fiat currency. */
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
  const assetListAsset = getAssetFromAssetList({
    sourceDenom: asset.sourceDenom,
    coinMinimalDenom: asset.coinMinimalDenom,
    assetLists: AssetLists,
  });

  let coingeckoAsset:
    | NonNullable<
        Awaited<ReturnType<typeof queryCoingeckoSearch>>["coins"]
      >[number]
    | undefined;

  if (!assetListAsset) {
    console.error(
      `Asset ${asset.sourceDenom} not found on asset list registry.`
    );
  }

  const shouldCalculateUsingPools = Boolean(assetListAsset?.priceInfo);

  /**
   * Only search coingecko registry if the coingecko id is missing or the asset is not found in the registry.
   */
  try {
    if (
      (!assetListAsset || !assetListAsset.coinGeckoId) &&
      !shouldCalculateUsingPools &&
      asset.coinDenom
    ) {
      console.warn(
        "Searching on Coingecko registry for asset",
        asset.coinDenom
      );
      coingeckoAsset = await getCoingeckoCoin({ denom: asset.coinDenom });
    }
  } catch (e) {
    console.error("Failed to fetch asset from coingecko registry", e);
  }

  const id = coingeckoAsset?.api_symbol ?? assetListAsset?.coinGeckoId;

  if (shouldCalculateUsingPools && assetListAsset) {
    return await calculatePriceFromPriceId({
      asset: assetListAsset.rawAsset,
      currency,
    });
  }

  if (!id) {
    return undefined;
  }

  return await getCoingeckoPrice({ coingeckoId: id, currency });
}

/** Calculates the fiat value of an asset given any denom and base amount. */
export async function calcAssetValue({
  anyDenom,
  amount,
  currency = "usd",
}: {
  anyDenom: string;
  amount: Int | string;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec | undefined> {
  const asset = await getAsset({ anyDenom });

  if (!asset) return;

  const price = await getAssetPrice({
    asset,
    currency,
  });

  if (!price) return;

  const tokenDivision = DecUtils.getTenExponentN(asset.coinDecimals);

  if (typeof amount === "string") amount = new Int(amount);

  return amount.toDec().quo(tokenDivision).mul(price);
}

const tokenHistoricalPriceCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);
/** Cached query function for getting an asset's historical price for a given token and time frame. */
export async function getAssetHistoricalPrice({
  coinDenom,
  timeFrameMinutes,
  numRecentFrames,
}: {
  /** Major (symbol) denom to fetch historical price data for. */
  coinDenom: string;
  /** Number of minutes per bar. So 60 refers to price every hour. */
  timeFrameMinutes: TimeFrame;
  /** How many recent price values to splice with.
   *  For example, with `timeFrameMinutes` set to every hour (60) and `numRecentFrames` set to 24, you get the last day's worth of hourly prices. */
  numRecentFrames?: number;
}): Promise<TokenHistoricalPrice[]> {
  return await cachified({
    cache: tokenHistoricalPriceCache,
    key: `token-historical-price-${coinDenom}-${timeFrameMinutes}-${
      numRecentFrames ?? "all"
    }`,
    ttl: 1000 * 60 * 3, // 3 minutes
    getFreshValue: () =>
      numRecentFrames
        ? queryTokenHistoricalChart({
            coinDenom,
            timeFrameMinutes: timeFrameMinutes,
          }).then((prices) => prices.slice(-numRecentFrames))
        : queryTokenHistoricalChart({
            coinDenom,
            timeFrameMinutes: timeFrameMinutes,
          }),
  });
}

export type CommonHistoricalPriceTimeFrame = "1H" | "1D" | "1W" | "1M";
/** Get's recent historical price data given common time frame literals.
 *  The configurations for each time frame are as follows:
 *
 *  - "1H": 5-minute bars, last hour of prices (12 recent frames)
 *  - "1D": 1-hour bars, last day of prices (24 recent frames)
 *  - "1W": 12-hour bars, last week of prices (14 recent frames)
 *  - "1M": 1-day bars, last month of prices (30 recent frames)
 */
export async function getCommonTimeFrameAssetHistoricalPrice({
  coinDenom,
  timeFrame,
}: {
  coinDenom: string;
  timeFrame: CommonHistoricalPriceTimeFrame;
}) {
  let timeFrameMinutes;
  switch (timeFrame) {
    case "1H":
      timeFrameMinutes = 5 as TimeFrame; // 5 minute bars
    case "1D":
      timeFrameMinutes = 60 as TimeFrame; // 1 hour bars
    case "1W":
      timeFrameMinutes = 720 as TimeFrame; // 12 hour bars
    case "1M":
      timeFrameMinutes = 1440 as TimeFrame; // 1 day bars
  }
  timeFrameMinutes = timeFrameMinutes as TimeFrame;

  let numRecentFrames;
  if (timeFrame === "1H") {
    numRecentFrames = 12; // Last hour of prices in 5 bars of minutes
  } else if (timeFrame === "1D") {
    numRecentFrames = 24; // Last day of prices with bars of 60 minutes
  } else if (timeFrame === "1W") {
    numRecentFrames = 14; // Last week of prices with bars of 12 hours
  } else if (timeFrame === "1M") {
    numRecentFrames = 30; // Last month of prices with bars as 1 day
  }

  return getAssetHistoricalPrice({
    coinDenom,
    timeFrameMinutes,
    numRecentFrames,
  });
}
