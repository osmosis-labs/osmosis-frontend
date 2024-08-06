import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { CoingeckoVsCurrencies } from "../../../../queries/coingecko";
import { DEFAULT_LRU_OPTIONS } from "../../../../utils/cache";
import { captureErrorAndReturn } from "../../../../utils/error";
import { getAsset } from "..";
import { getCoingeckoPrice } from "./providers/coingecko";
import { getPriceFromSidecar } from "./providers/sidecar";

/** Provides a price (no caching) given a valid asset from asset list and a fiat currency code.
 *  @throws if there's an issue getting the price. */
export type PriceProvider = (coinMinimalDenom: string) => Promise<Dec>;

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Finds the fiat value of a single unit of a given asset denominated in USDC.
 *  Assets can be identified either by `coinMinimalDenom`.
 *  @throws if the coinMinimalDenom is not given or fails to fetch the price from data source */
export async function getNativeAssetPrice(
  coinMinimalDenom: string
): Promise<Dec> {
  if (!coinMinimalDenom) {
    throw new Error("coinDenom is required");
  }

  return cachified({
    key: `asset-price-nat-${coinMinimalDenom}`,
    cache: pricesCache,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: () => getPriceFromSidecar(coinMinimalDenom),
  });
}

/** Finds the fiat value of a single unit of a given asset for a given fiat currency.
 *  Assets can be identified either by one of:
 * -`coinMinimalDenom`
 * - chainID & address
 * - coinGecko ID
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found (missing in asset list or can't get price). */
export async function getAssetPrice({
  assetLists,
  asset,
  currency = "usd",
  priceProvider = getNativeAssetPrice,
}: {
  chainList: Chain[];
  assetLists: AssetList[];
  asset: { coinDenom?: string } & (
    | { coinMinimalDenom: string }
    | { chainId: number | string; address: string }
    | { coinGeckoId: string }
  );
  currency?: CoingeckoVsCurrencies;
  priceProvider?: PriceProvider;
}): Promise<Dec> {
  const coinMinimalDenom =
    "coinMinimalDenom" in asset ? asset.coinMinimalDenom : undefined;
  const { chainId, address } =
    "chainId" in asset && "address" in asset
      ? asset
      : { chainId: undefined, address: undefined };
  const coinGeckoId = "coinGeckoId" in asset ? asset.coinGeckoId : undefined;

  const foundAsset = assetLists
    .map((assets) => assets.assets)
    .flat()
    .find(
      (asset) =>
        (coinMinimalDenom && asset.coinMinimalDenom === coinMinimalDenom) ||
        (chainId &&
          address &&
          asset.counterparty.some(
            (counterparty) =>
              "chainId" in counterparty &&
              "address" in counterparty &&
              counterparty.chainId === chainId &&
              counterparty.address.toLowerCase() === address.toLowerCase()
          ))
    );

  // Fall back to CoinGecko if asset list does not provide
  // the Osmosis asset that can be used for prices from Osmosis.
  if (!foundAsset && coinGeckoId) {
    return getCoingeckoPrice({ coinGeckoId, currency });
  }

  if (!foundAsset)
    throw new Error(
      `Asset ${
        asset.coinDenom ?? coinMinimalDenom
      } not found in asset list registry.`
    );

  return cachified({
    key: `asset-price-${foundAsset.coinMinimalDenom}`,
    cache: pricesCache,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: () => priceProvider(foundAsset.coinMinimalDenom),
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
  anyDenom,
  amount,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  anyDenom: string;
  amount: Int | Dec | string;
  currency?: CoingeckoVsCurrencies;
}): Promise<Dec> {
  const asset = getAsset({ assetLists, anyDenom });

  const price = await getNativeAssetPrice(asset.coinMinimalDenom);

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
