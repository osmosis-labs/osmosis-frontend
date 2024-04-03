import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Asset, AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { CoingeckoVsCurrencies } from "../../../../queries/coingecko";
import { DEFAULT_LRU_OPTIONS } from "../../../../utils/cache";
import { captureErrorAndReturn } from "../../../../utils/error";
import { getAsset } from "..";
import { getPriceFromSidecar } from "./providers/sidecar";

/** Provides a price (no caching) given a valid asset from asset list and a fiat currency code.
 *  @throws if there's an issue getting the price. */
export type PriceProvider = (
  assetLists: AssetList[],
  chainList: Chain[],
  asset: Asset,
  currency?: CoingeckoVsCurrencies
) => Promise<Dec>;

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Finds the fiat value of a single unit of a given asset for a given fiat currency.
 *  Assets can be identified either by `coinMinimalDenom` or `sourceDenom`.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found (missing in asset list or can't get price). */
export async function getAssetPrice({
  assetLists,
  chainList,
  asset,
  currency = "usd",
  priceProvider = getPriceFromSidecar,
}: {
  chainList: Chain[];
  assetLists: AssetList[];
  asset: { coinDenom?: string } & (
    | { coinMinimalDenom: string }
    | { sourceDenom: string }
  );
  currency?: CoingeckoVsCurrencies;
  priceProvider?: PriceProvider;
}): Promise<Dec> {
  const coinMinimalDenom =
    "coinMinimalDenom" in asset ? asset.coinMinimalDenom : undefined;
  const sourceDenom = "sourceDenom" in asset ? asset.sourceDenom : undefined;

  const foundAsset = assetLists
    .map((assets) => assets.assets)
    .flat()
    .find(
      (asset) =>
        (coinMinimalDenom && asset.coinMinimalDenom === coinMinimalDenom) ||
        (sourceDenom && asset.sourceDenom === sourceDenom)
    );

  if (!foundAsset)
    throw new Error(
      `Asset ${
        asset.coinDenom ?? coinMinimalDenom ?? sourceDenom
      } not found in asset list registry.`
    );

  return cachified({
    key: `asset-price-${foundAsset.coinMinimalDenom}`,
    cache: pricesCache,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: () =>
      priceProvider(assetLists, chainList, foundAsset, currency),
  });
}

/** Calculates the fiat value of a given coin.
 *  @throws If there's an issue calculating the price for the given coin (missing in asset list or can't get price). */
export function calcCoinValue({
  coin,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  coin: CoinPretty;
}) {
  return calcAssetValue({
    ...params,
    anyDenom: coin.currency.coinMinimalDenom,
    amount: coin.toCoin().amount,
  });
}

/** Calculates the fiat value of an asset given any denom and base amount.
 *  @throws If there's an issue calculating the price for the given denom (missing in asset list or can't get price). */
export async function calcAssetValue({
  assetLists,
  chainList,
  anyDenom,
  amount,
  currency = "usd",
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  anyDenom: string;
  amount: Int | Dec | string;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec> {
  const asset = getAsset({ assetLists, anyDenom });

  const price = await getAssetPrice({
    assetLists,
    chainList,
    asset,
    currency,
  });

  const tokenDivision = DecUtils.getTenExponentN(asset.coinDecimals);

  if (typeof amount === "string") amount = new Int(amount);

  return (amount instanceof Dec ? amount : amount.toDec())
    .quo(tokenDivision)
    .mul(price);
}

/** Calculate and sum the value of multiple coins.
 *  Will only include listed assets with prices as part of sum. */
export function calcSumCoinsValue({
  coins,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  coins: CoinPretty[];
}) {
  return calcSumAssetsValue({
    ...params,
    assets: coins
      .map((coin) => coin.toCoin())
      .map((coin) => ({ anyDenom: coin.denom, amount: coin.amount })),
  });
}

/** Calculate and sum the value of multiple assets.
 *  Will only include listed assets with prices as part of sum. */
export async function calcSumAssetsValue({
  assets,
  currency = "usd",
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  assets: {
    anyDenom: string;
    amount: Int | string;
  }[];
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec> {
  return (
    await Promise.all(
      assets.map((asset) =>
        calcAssetValue({
          ...params,
          ...asset,
          currency,
        }).catch((e) => captureErrorAndReturn(e, new Dec(0)))
      )
    )
  ).reduce((acc, price) => acc.add(price), new Dec(0));
}

export * from "./historical";
