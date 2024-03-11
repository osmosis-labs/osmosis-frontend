import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryPrices,
  QUOTE_COIN_MINIMAL_DENOM,
} from "~/server/queries/sidecar/prices";
import { EdgeDataLoader } from "~/utils/batching";
import { LARGE_LRU_OPTIONS } from "~/utils/cache";

import { getPriceFromCoinGecko } from "./coingecko";

const sidecarCache = new LRUCache<string, CacheEntry>(LARGE_LRU_OPTIONS);

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(asset: Asset) {
  return getPriceBatched(asset);
}

/** Prevent long-running batch loaders as recommended by `DataLoader` docs. */
function getBatchLoader() {
  return cachified({
    cache: sidecarCache,
    key: "sidecar-batch-loader",
    ttl: 1000 * 60 * 10, // 10 minutes
    getFreshValue: () =>
      new EdgeDataLoader(
        (coinMinimalDenoms: readonly string[]) => {
          return queryPrices(coinMinimalDenoms as string[]).then((priceMap) =>
            coinMinimalDenoms.map((baseCoinMinimalDenom) => {
              try {
                const price =
                  priceMap[baseCoinMinimalDenom][QUOTE_COIN_MINIMAL_DENOM];

                // trim to 18 decimals to silence Dec warnings
                const p = price.replace(/(\.\d{18})\d*/, "$1");

                if (new Dec(p).isZero())
                  return new Error(
                    `No SQS price result for ${baseCoinMinimalDenom} and USDC`
                  );
                else return p;
              } catch (e) {
                return new Error(
                  `No SQS price result for ${baseCoinMinimalDenom} and USDC`
                );
              }
            })
          );
        },
        {
          // SQS imposes a limit on URI length from its Nginx configuration, so we impose a limit to avoid hitting that limit.
          maxBatchSize: 100,
        }
      ),
  });
}

export function getPriceBatched(asset: Asset) {
  return cachified({
    cache: sidecarCache,
    key: `sidecar-price-${asset.coinMinimalDenom}`,
    ttl: 1000 * 60, // 1 minute
    getFreshValue: () =>
      getBatchLoader().then((loader) =>
        loader
          .load(asset.coinMinimalDenom)
          .then((price) => new Dec(price))
          .catch(() => getPriceFromCoinGecko(asset))
      ),
  });
}
