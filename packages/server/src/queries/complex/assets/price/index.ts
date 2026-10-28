import { Asset, AssetList, Chain } from "@osmosis-labs/types";
import { CoinPretty, Dec, DecUtils, Int } from "@osmosis-labs/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { CoingeckoVsCurrencies } from "../../../../queries/coingecko";
import { DEFAULT_LRU_OPTIONS } from "../../../../utils/cache";
import { captureErrorAndReturn } from "../../../../utils/error";
import { getAsset } from "..";
import { getCoingeckoPrice } from "./providers/coingecko";
import { getPriceFromSidecar, NoSqsPriceError } from "./providers/sidecar";
import { resolveUnpricedHolding } from "./unpriced-holding";

/** Provides a price (no caching) given a valid asset from asset list and a fiat currency code.
 *  @throws if there's an issue getting the price. */
export type PriceProvider = (
  asset: Asset,
  currency?: CoingeckoVsCurrencies
) => Promise<Dec>;

const pricesCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Assets SQS has no price for, retried after the ttl. cachified doesn't keep failures,
 *  so without this an asset with no price (e.g. no pools) is re-sent to SQS on every
 *  request, and those are the denoms SQS route-searches. Only that "no price" answer is
 *  kept, never a price: a transient failure (5xx, timeout, expired batch) says nothing
 *  about the asset and must be retried at once. */
const priceFailures = new LRUCache<string, Error>({
  max: 1_500,
  ttl: 1000 * 30, // 30 seconds
});
/** Finds the fiat value of a single unit of a given asset for a given fiat currency.
 *  Assets can be identified either by `coinMinimalDenom` or `sourceDenom`.
 *  @throws If the asset is not found in the asset list registry or the asset's price info is not found (missing in asset list or can't get price). */
export async function getAssetPrice({
  assetLists,
  asset,
  currency = "usd",
  priceProvider = getPriceFromSidecar,
}: {
  chainList: Chain[];
  assetLists: AssetList[];
  asset: { coinDenom?: string } & (
    | { coinMinimalDenom: string }
    | { chainId: number | string; address: string }
    | { coinGeckoId: string }
    | { sourceDenom: string }
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
  const sourceDenom = "sourceDenom" in asset ? asset.sourceDenom : undefined;
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
          )) ||
        (sourceDenom && asset.sourceDenom === sourceDenom)
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

  const key = `asset-price-${foundAsset.coinMinimalDenom}`;
  const failure = priceFailures.get(key);
  if (failure) throw failure;

  return cachified({
    key,
    cache: pricesCache,
    ttl: 1000 * 10, // 10 seconds
    getFreshValue: () => priceProvider(foundAsset, currency),
  }).catch((e) => {
    if (e instanceof NoSqsPriceError) priceFailures.set(key, e);
    throw e;
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

/** Smallest display amount whose value can't round to zero at any real price. */
const MIN_PRICEABLE_AMOUNT = new Dec("0.000001");

const assetsByMinimalDenom = new WeakMap<AssetList[], Map<string, Asset>>();
/** `coinMinimalDenom` lookup that indexes each asset list array once, since the check
 *  runs per coin and per zero-cap reserve across all pools. First match wins. */
function findAssetByMinimalDenom(
  assetLists: AssetList[],
  coinMinimalDenom: string
): Asset | undefined {
  let index = assetsByMinimalDenom.get(assetLists);
  if (!index) {
    index = new Map();
    for (const { assets } of assetLists) {
      for (const asset of assets) {
        if (!index.has(asset.coinMinimalDenom))
          index.set(asset.coinMinimalDenom, asset);
      }
    }
    assetsByMinimalDenom.set(assetLists, index);
  }
  return index.get(coinMinimalDenom);
}

/** True when a held coin with no value means its price is unavailable, so the value is
 *  unknown rather than zero. That holds only for assets that should always have a price:
 *  listed, verified and not preview, disabled or unstable. Spam, sunset and halted assets
 *  are expected to have no price, and a tiny amount can round to a zero value. */
export function isHoldingValueUnknown({
  assetLists,
  coinMinimalDenom,
  amount,
}: {
  assetLists: AssetList[];
  coinMinimalDenom: string;
  amount: string;
}): boolean {
  const asset = findAssetByMinimalDenom(assetLists, coinMinimalDenom);
  if (
    !asset ||
    !asset.verified ||
    asset.preview ||
    asset.disabled ||
    asset.unstable
  ) {
    return false;
  }

  return new Dec(amount)
    .quo(DecUtils.getTenExponentN(asset.decimals))
    .gte(MIN_PRICEABLE_AMOUNT);
}

/** Sums the value of the given coins, or returns `undefined` when a coin that should have
 *  a price (see `isHoldingValueUnknown`) can't be priced. Unlike `calcSumCoinsValue`, that
 *  coin isn't counted as zero, which would understate the value. The one exception is an
 *  asset SQS has no price for, with no price from the other sources and every SQS pool
 *  holding it drained (see `resolveUnpricedHolding`). */
export async function calcSumCoinsValueOrUnknown({
  coins,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  coins: CoinPretty[];
}): Promise<Dec | undefined> {
  const values = await Promise.all(
    coins
      .filter((coin) => coin.toDec().isPositive())
      .map((coin) => {
        const { denom, amount } = coin.toCoin();
        return calcAssetValue({ ...params, anyDenom: denom, amount }).catch(
          (error) =>
            isHoldingValueUnknown({
              assetLists: params.assetLists,
              coinMinimalDenom: denom,
              amount,
            })
              ? resolveUnpricedHolding({
                  assetLists: params.assetLists,
                  coinMinimalDenom: denom,
                  amount,
                  error,
                })
              : new Dec(0)
        );
      })
  );
  let sum = new Dec(0);
  for (const value of values) {
    if (value === undefined) return undefined;
    sum = sum.add(value);
  }
  return sum;
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
