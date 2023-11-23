import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import {
  makeStaticPoolFromRaw,
  PoolRaw,
} from "@osmosis-labs/pools/build/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";
import { PoolPriceRoutes } from "~/config/price";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "~/server/queries/coingecko";
import { queryPaginatedPools } from "~/server/queries/complex/pools";

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

async function getCoingeckoCoin({ denom }: { denom: string }) {
  return cachified({
    cache: pricesCache,
    key: `coingecko-coin-${denom}`,
    getFreshValue: async () => {
      try {
        const { coins } = await queryCoingeckoSearch(denom);
        return coins?.find(
          ({ symbol }) => symbol?.toLowerCase() === denom.toLowerCase()
        );
      } catch (e) {
        console.error("queryCoingeckoSearch", denom, e);
      }
    },
    ttl: 60 * 1000, // 1 minute
  });
}

async function getCoingeckoPrice({
  coinGeckoId,
  currency,
}: {
  coinGeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  return cachified({
    cache: pricesCache,
    key: `coingecko-price-${coinGeckoId}-${currency}`,
    getFreshValue: async () => {
      try {
        const prices = await querySimplePrice([coinGeckoId], [currency]);
        const price = prices[coinGeckoId]?.[currency];
        return price ? price.toString() : undefined;
      } catch (e) {
        console.error("getCoingeckoPrice", coinGeckoId, e);
      }
    },
    ttl: 60 * 1000, // 1 minute
  });
}

/**
 * Calculates the price of a pool price id.
 *
 * Pool price ids are prefixed with `pool:`. They are
 * located in the `packages/web/config/price.ts` file.
 *
 * To calculate the price it:
 * 1. Finds the pool price route
 * 2. Gets the spot price of the pool
 * 3. Calculated the price of the destination coin recursively (i.e. usd-coin or another pool like uosmo)
 *
 * Note: For now only "usd" is supported.
 */
async function calculatePriceFromPriceId({
  sourceDenom,
  priceId,
  currency,
}: {
  sourceDenom: string;
  priceId: string;
  currency: "usd";
}): Promise<string | undefined> {
  if (!priceId) return undefined;

  const poolPriceRoute = PoolPriceRoutes.find(
    ({ alternativeCoinId }) => priceId === alternativeCoinId
  );

  // Fetch directly from coingecko if the price id is not a pool price route
  if (!poolPriceRoute && !priceId.startsWith("pool:")) {
    return await getCoingeckoPrice({ coinGeckoId: priceId, currency });
  }

  if (!poolPriceRoute) return undefined;

  const tokenInMinimalDenom = poolPriceRoute.spotPriceSourceDenom;
  const tokenOutMinimalDenom = poolPriceRoute.spotPriceDestDenom;

  const tokenInAsset = getAssetFromAssetList({
    sourceDenom,
    coinGeckoId: priceId,
    assetLists: AssetLists,
  });

  const tokenOutPossibleSourceDenom =
    poolPriceRoute.destCoinId.split("pool:")[1];
  const tokenOutAsset = getAssetFromAssetList({
    coinGeckoId: poolPriceRoute.destCoinId,
    // Try to find asset with id coming after `pool:` which sometimes can be the minimal denom
    sourceDenom: tokenOutPossibleSourceDenom,
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
      .getSpotPriceInOverOutWithoutSwapFee(
        tokenInMinimalDenom,
        tokenOutMinimalDenom
      )
      .mulTruncate(multiplication)
  );

  const spotPriceDec = inSpotPrice.toDec().equals(new Dec(0))
    ? new Dec(0)
    : new Dec(1).quo(inSpotPrice.toDec());

  const destCoinPrice = await calculatePriceFromPriceId({
    sourceDenom: tokenOutAsset?.sourceDenom ?? tokenOutPossibleSourceDenom,
    priceId: poolPriceRoute.destCoinId,
    currency,
  });

  if (!destCoinPrice) return undefined;

  const res = parseFloat(spotPriceDec.toString()) * parseFloat(destCoinPrice);
  if (!isNaN(res)) {
    // CoinGeckoPriceStore uses the `Dec` to calculate the price of assets.
    // However, `Dec` requires that the decimals must not exceed 18.
    // Since the spot price is `Dec`, it can have 18 decimals,
    // and if the `destCoinPrice` has the fraction, the multiplication can make the more than 18 decimals.
    // To prevent this problem, shorthand the fraction part.
    return res.toFixed(10);
  }
}

export async function getAssetPrice({
  asset,
  currency = "usd",
}: {
  asset: Partial<{
    coinDenom: string;
    coinGeckoId: string;
    /** IBC or native denom */
    coinMinimalDenom: string;
  }>;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec | undefined> {
  if (!asset.coinDenom && !asset.coinMinimalDenom) {
    console.error(
      "getAssetPrice: asset is missing coinDenom or coinMinimalDenom"
    );
    return undefined;
  }

  const assetListAsset = getAssetFromAssetList({
    coinMinimalDenom: asset.coinMinimalDenom,
    coinGeckoId: asset.coinGeckoId,
    assetLists: AssetLists,
  });

  let coingeckoAsset:
    | NonNullable<
        Awaited<ReturnType<typeof queryCoingeckoSearch>>["coins"]
      >[number]
    | undefined;

  if (!assetListAsset) {
    console.warn(`Asset ${asset.coinDenom} not found on asset list registry.`);
  }

  // Only search coingecko registry if the coingecko id is missing or the asset is not found in the registry.
  // As a last resort attempt at finding asset price identifiers
  try {
    if ((!assetListAsset || !assetListAsset.coinGeckoId) && asset.coinDenom) {
      coingeckoAsset = await getCoingeckoCoin({ denom: asset.coinDenom });
    }
  } catch {
    console.error(
      "Problem fetching unregistered asset info from CoinGecko",
      asset.coinDenom
    );
    return undefined;
  }

  const priceId =
    assetListAsset?.priceCoinId ??
    coingeckoAsset?.api_symbol ??
    assetListAsset?.coinGeckoId;

  if (!priceId) {
    return undefined;
  }

  if (priceId.startsWith("pool:") && assetListAsset?.sourceDenom) {
    const priceRaw = await calculatePriceFromPriceId({
      sourceDenom: assetListAsset.sourceDenom,
      priceId,
      currency,
    });

    return priceRaw ? new Dec(priceRaw) : undefined;
  }

  const priceRaw = await getCoingeckoPrice({ coinGeckoId: priceId, currency });
  return priceRaw ? new Dec(priceRaw) : undefined;
}
