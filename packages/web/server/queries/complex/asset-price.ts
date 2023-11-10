import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { makeStaticPoolFromRaw, PoolRaw } from "@osmosis-labs/stores";

import { PoolPriceRoutes } from "~/config";
import { getAssetFromWalletAssets } from "~/config/assets-utils";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "~/server/queries/coingecko";
import { queryPaginatedPools } from "~/server/queries/complex/pools";

async function getCoingeckoCoin({ denom }: { denom: string }) {
  try {
    return await queryCoingeckoSearch(denom).then(({ coins }) =>
      coins?.find(({ symbol }) => symbol?.toLowerCase() === denom.toLowerCase())
    );
  } catch {}
}

async function getCoingeckoPrice({
  coingeckoId,
  currency,
}: {
  coingeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  const prices = await querySimplePrice([coingeckoId], [currency]);
  const price = prices[coingeckoId]?.[currency];
  return price ? price.toString() : undefined;
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
  tokenInMinimalDenom,
  priceId,
  currency,
}: {
  tokenInMinimalDenom: string;
  priceId: string;
  currency: "usd";
}): Promise<string | undefined> {
  if (!priceId) return undefined;

  const poolPriceRoute = PoolPriceRoutes.find(
    ({ alternativeCoinId }) => priceId === alternativeCoinId
  );

  /**
   * Fetch directly from coingecko if the price id is not a pool price route
   */
  if (!poolPriceRoute && !priceId.startsWith("pool:")) {
    return await getCoingeckoPrice({ coingeckoId: priceId, currency });
  }

  if (!poolPriceRoute) return undefined;

  const tokenInIbc = poolPriceRoute.spotPriceSourceDenom;
  const tokenOutIbc = poolPriceRoute.spotPriceDestDenom;

  const tokenInAsset = getAssetFromWalletAssets({
    minimalDenom: tokenInMinimalDenom,
    coingeckoId: priceId,
  });

  const tokenOutPossibleMinDenom = poolPriceRoute.destCoinId.split("pool:")[1];
  const tokenOutAsset = getAssetFromWalletAssets({
    coingeckoId: poolPriceRoute.destCoinId,
    // Try to find asset with id coming after `pool:` which sometimes can be the minimal denom
    minimalDenom: tokenOutPossibleMinDenom,
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
    tokenInMinimalDenom:
      tokenOutAsset?.minimalDenom ?? tokenOutPossibleMinDenom,
    priceId: poolPriceRoute.destCoinId,
    currency,
  });

  if (!destCoinPrice) return undefined;

  const res = parseFloat(spotPriceDec.toString()) * parseFloat(destCoinPrice);
  if (Number.isNaN(res)) {
    return;
  }

  // CoinGeckoPriceStore uses the `Dec` to calculate the price of assets.
  // However, `Dec` requires that the decimals must not exceed 18.
  // Since the spot price is `Dec`, it can have 18 decimals,
  // and if the `destCoinPrice` has the fraction, the multiplication can make the more than 18 decimals.
  // To prevent this problem, shorthand the fraction part.
  return res.toFixed(10);
}

export async function getAssetPrice({
  asset,
  currency,
}: {
  asset: {
    denom: string;
    minimalDenom: string;
  };
  currency: CoingeckoVsCurrencies;
}): Promise<string | undefined> {
  const walletAsset = getAssetFromWalletAssets({
    minimalDenom: asset.minimalDenom,
  });

  let coingeckoAsset:
    | NonNullable<
        Awaited<ReturnType<typeof queryCoingeckoSearch>>["coins"]
      >[number]
    | undefined;

  /**
   * Only search coingecko registry if the coingecko id is missing or
   * starts with 'pool:' and has to be calculated with Osmosis pools
   */
  try {
    if (
      !walletAsset ||
      walletAsset.coingeckoId?.startsWith("pool:") ||
      !walletAsset.coingeckoId
    ) {
      coingeckoAsset = await getCoingeckoCoin({ denom: asset.denom });
    }
  } catch {}

  const id = coingeckoAsset?.api_symbol ?? walletAsset?.coingeckoId;

  if (!id) {
    return undefined;
  }

  if (id.startsWith("pool:")) {
    return await calculatePriceFromPriceId({
      tokenInMinimalDenom: asset.minimalDenom,
      priceId: id,
      currency,
    });
  }

  return await getCoingeckoPrice({ coingeckoId: id, currency });
}
