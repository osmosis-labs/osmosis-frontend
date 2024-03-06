import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { AssetLists } from "~/config/generated/asset-lists";
import { CoingeckoVsCurrencies } from "~/server/queries/coingecko";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import { getAsset } from "..";
import { getPriceFromPools } from "./providers/pools";

/** Provides a price given a valid asset from asset list and a fiat currency code.
 *  @throws if there's an issue getting the price. */
export type PriceProvider = (
  asset: Asset,
  currency: CoingeckoVsCurrencies
) => Promise<Dec>;

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Finds the fiat value of a single unit of a given asset for a given fiat currency.
 *  Assets can be identified either by `coinMinimalDenom` or `sourceDenom`.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found. */
export async function getAssetPrice({
  asset,
  currency = "usd",
  priceProvider = getPriceFromPools,
}: {
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

  const foundAsset = getAssetFromAssetList({
    sourceDenom,
    coinMinimalDenom,
    assetLists: AssetLists,
  })?.rawAsset;

  if (!foundAsset)
    throw new Error(
      `Asset ${
        asset.coinDenom ?? coinMinimalDenom ?? sourceDenom
      } not found in asset list registry.`
    );

  return cachified({
    key: `asset-price-${foundAsset.coinMinimalDenom}`,
    cache: pricesCache,
    ttl: 1000 * 30, // 30 seconds, as calculating prices is expensive and cached remotely
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes, to allow plenty of time for pools to be queried in background
    getFreshValue: () => priceProvider(foundAsset, currency),
  });
}

export function calcCoinValue(coin: CoinPretty) {
  return calcAssetValue({
    anyDenom: coin.currency.coinMinimalDenom,
    amount: coin.toCoin().amount,
  });
}

/** Calculates the fiat value of an asset given any denom and base amount.
 *  @throws If there's an issue calculating the price for the given denom. */
export async function calcAssetValue({
  anyDenom,
  amount,
  currency = "usd",
}: {
  anyDenom: string;
  amount: Int | Dec | string;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec> {
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

/** Calculate and sum the value of multiple coins.
 *  Will only include listed assets as part of sum. */
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
}): Promise<Dec> {
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

export * from "./historical";
