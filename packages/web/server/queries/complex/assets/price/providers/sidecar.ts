import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryPrices,
  QUOTE_COIN_MINIMAL_DENOM,
} from "~/server/queries/sidecar/prices";
import { EdgeDataLoader } from "~/utils/batching";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import { getCoingeckoPrice, searchCoinGeckoCoinId } from "./coingecko";

const sidecarCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(asset: Asset) {
  return getSidecarPriceBatched(asset);
}

/** Used with `DataLoader` to make batched calls to CoinGecko.
 *  This allows us to provide IDs in a batch to CoinGecko, which is more efficient than making individual calls. */
async function batchFetchSqsPrices(coinMinimalDenoms: readonly string[]) {
  const priceMap = await queryPrices(coinMinimalDenoms as string[]);
  return coinMinimalDenoms.map((baseCoinMinimalDenom) => {
    const price = priceMap[baseCoinMinimalDenom][QUOTE_COIN_MINIMAL_DENOM];

    if (price === "no routes were provided" || !price)
      return new Error(
        `No SQS price result for ${baseCoinMinimalDenom} and USDC`
      );
    else return price;
  });
}
const batchLoader = new EdgeDataLoader(
  (ids: readonly string[]) => batchFetchSqsPrices(ids),
  {
    maxBatchSize: 30,
  }
);
export async function getSidecarPriceBatched({
  symbol,
  coinMinimalDenom,
  coingeckoId,
}: {
  symbol: string;
  coinMinimalDenom: string;
  coingeckoId?: string;
}) {
  // Cache a result per CoinGecko ID *and* currency ID.
  return cachified({
    cache: sidecarCache,
    key: `coingecko-price-${coinMinimalDenom}`,
    ttl: 1000 * 60, // 1 minute
    staleWhileRevalidate: 1000 * 60 * 2, // 2 minutes
    getFreshValue: () =>
      batchLoader
        .load(coinMinimalDenom)
        .then((price) => new Dec(price))
        .catch(async () => {
          // fallback to coingekco if no result on sidecar
          let coinGeckoId = coingeckoId;

          if (!coinGeckoId) {
            coinGeckoId = await searchCoinGeckoCoinId({ symbol });
          }

          if (!coinGeckoId) {
            throw new Error(`Asset ${symbol} has no identifier for pricing.`);
          }

          return await getCoingeckoPrice({ coinGeckoId, currency: "usd" });
        }),
  });
}
