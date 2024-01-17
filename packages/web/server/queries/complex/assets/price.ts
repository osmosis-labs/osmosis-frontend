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
import { queryPaginatedPools } from "~/server/queries/complex/pools/providers/imperator";

import {
  queryTokenHistoricalChart,
  TimeFrame,
  TokenHistoricalPrice,
} from "../../imperator/token-historical-chart";
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
 *
 * @throws If the asset is not found in the asset list registry or the asset's price info is not found.
 */
async function calculatePriceFromPriceId({
  asset,
  currency,
}: {
  asset: Pick<Asset, "base" | "price_info" | "coingecko_id">;
  currency: "usd";
}): Promise<Dec | undefined> {
  if (!asset.price_info && !asset.coingecko_id)
    throw new Error("No price info or coingecko id for " + asset.base);

  /**
   * Fetch directly from coingecko if there's no price info.
   */
  if (!asset.price_info && asset.coingecko_id) {
    return await getCoingeckoPrice({
      coingeckoId: asset.coingecko_id,
      currency,
    });
  }

  if (!asset.price_info) throw new Error("No price info for " + asset.base);

  const poolPriceRoute = {
    destCoinMinimalDenom: asset.price_info.dest_coin_minimal_denom,
    poolId: asset.price_info.pool_id,
    sourceCoinMinimalDenom: asset.base,
  };

  if (!poolPriceRoute) throw new Error("No pool price route for " + asset.base);

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

  if (!tokenOutAsset.decimals || !tokenInAsset.decimals)
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

  const destCoinPrice = await calculatePriceFromPriceId({
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

  let coingeckoAsset:
    | NonNullable<
        Awaited<ReturnType<typeof queryCoingeckoSearch>>["coins"]
      >[number]
    | undefined;

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
    throw new Error(
      `Asset ${asset.sourceDenom} has no identifier for pricing.`
    );
  }

  return await getCoingeckoPrice({ coingeckoId: id, currency });
}

/** Calculates the fiat value of an asset given any denom and base amount.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found. */
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

  if (!asset) throw new Error(anyDenom + " not found in asset list");

  const price = await getAssetPrice({
    asset,
    currency,
  });

  if (!price) throw new Error(anyDenom + " price not available");

  const tokenDivision = DecUtils.getTenExponentN(asset.coinDecimals);

  if (typeof amount === "string") amount = new Int(amount);

  return amount.toDec().quo(tokenDivision).mul(price);
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
    getFreshValue: () =>
      queryTokenHistoricalChart({
        coinDenom,
        timeFrameMinutes: timeFrame as TimeFrame,
      }).then((prices) =>
        numRecentFrames ? prices.slice(-numRecentFrames) : prices
      ),
  });
}
