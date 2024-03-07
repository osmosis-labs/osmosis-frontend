import { Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { makeStaticPoolFromRaw, PoolRaw } from "@osmosis-labs/pools";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList, isNil } from "@osmosis-labs/utils";

import { AssetLists } from "~/config/generated/asset-lists";
import { CoingeckoVsCurrencies } from "~/server/queries/coingecko";
import { queryPaginatedPools } from "~/server/queries/complex/pools/providers/indexer";

import { getCoingeckoPrice, getPriceFromCoinGecko } from "./coingecko";

/** Calculates prices by querying pools and finding spot prices through routes in those pools. Falls back to CoinGecko if price not found.
 *  @throws if there's no price info for that asset, or there's an issue calculating the price. */
export async function getPriceFromPools(
  asset: Asset,
  currency: CoingeckoVsCurrencies = "usd"
): Promise<Dec> {
  if (asset.price) {
    return await calculatePriceThroughPools({
      asset,
      currency,
    });
  }

  return await getPriceFromCoinGecko(asset, currency);
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
 * @throws If the asset is not found in the asset list registry or the asset's price info is not found. Or if there's an issue getting the price from CoinGecko.
 */
async function calculatePriceThroughPools({
  asset,
  currency,
}: {
  asset: Pick<Asset, "coinMinimalDenom" | "price" | "coingeckoId">;
  currency: "usd";
}): Promise<Dec> {
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
