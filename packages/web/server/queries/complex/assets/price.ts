import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
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
  const walletAsset = getAssetFromAssetList({
    sourceDenom: asset.sourceDenom,
    coinMinimalDenom: asset.coinMinimalDenom,
    assetLists: AssetLists,
  });

  let coingeckoAsset:
    | NonNullable<
        Awaited<ReturnType<typeof queryCoingeckoSearch>>["coins"]
      >[number]
    | undefined;

  if (!walletAsset) {
    console.log(`Asset ${asset.sourceDenom} not found on asset list registry.`);
  }

  const shouldCalculateUsingPools = Boolean(walletAsset?.priceInfo);

  /**
   * Only search coingecko registry if the coingecko id is missing or the asset is not found in the registry.
   */
  try {
    if (
      (!walletAsset || !walletAsset.coinGeckoId) &&
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

  const id = coingeckoAsset?.api_symbol ?? walletAsset?.coinGeckoId;

  if (shouldCalculateUsingPools && walletAsset) {
    return await calculatePriceFromPriceId({
      asset: walletAsset.rawAsset,
      currency,
    });
  }

  if (!id) {
    return undefined;
  }

  return await getCoingeckoPrice({ coingeckoId: id, currency });
}
