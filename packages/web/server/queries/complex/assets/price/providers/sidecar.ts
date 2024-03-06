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

import { getPriceFromCoinGecko } from "./coingecko";

const sidecarCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(asset: Asset) {
  return getPriceBatched(asset);
}

/** Used with `DataLoader` to make batched calls to SQS.
 *  This allows us to provide IDs in a batch to SQS, which is more efficient than making individual calls. */
const batchLoader = new EdgeDataLoader(
  (coinMinimalDenoms: readonly string[]) =>
    queryPrices(coinMinimalDenoms as string[]).then((priceMap) =>
      coinMinimalDenoms.map((baseCoinMinimalDenom) => {
        const price = priceMap[baseCoinMinimalDenom][QUOTE_COIN_MINIMAL_DENOM];

        if (price === "no routes were provided" || !price)
          return new Error(
            `No SQS price result for ${baseCoinMinimalDenom} and USDC`
          );
        else return price;
      })
    ),
  {
    // SQS imposes a limit on URI length from its Nginx configuration, so we impose a limit to avoid hitting that limit.
    maxBatchSize: 30,
  }
);

export function getPriceBatched(asset: Asset) {
  return cachified({
    cache: sidecarCache,
    key: `coingecko-price-${asset.coinMinimalDenom}`,
    ttl: 1000 * 60, // 1 minute
    staleWhileRevalidate: 1000 * 60 * 2, // 2 minutes
    getFreshValue: () =>
      batchLoader
        .load(asset.coinMinimalDenom)
        .then((price) => new Dec(price))
        .catch(() => getPriceFromCoinGecko(asset)),
  });
}
