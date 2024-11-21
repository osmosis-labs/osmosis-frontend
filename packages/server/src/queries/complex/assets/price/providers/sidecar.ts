import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryPrices,
  QUOTE_COIN_MINIMAL_DENOM,
} from "../../../../../queries/sidecar/prices";
import { EdgeDataLoader } from "../../../../../utils/batching";
import { LARGE_LRU_OPTIONS } from "../../../../../utils/cache";

const sidecarCache = new LRUCache<string, CacheEntry>(LARGE_LRU_OPTIONS);

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to pools then querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(asset: Asset) {
  return getBatchLoader().then((loader) =>
    loader
      .load(
        asset.coinMinimalDenom ===
          "ibc/8D294CE85345F171AAF6B1FF6E64B5A9EE197C99CDAD64D79EA4ACAB270AC95C"
          ? "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F"
          : asset.coinMinimalDenom
      )
      .then((price) => new Dec(price))
  );
}

/** Prevent long-running batch loaders as recommended by `DataLoader` docs. */
function getBatchLoader() {
  return cachified({
    cache: sidecarCache,
    key: "sidecar-batch-loader",
    // This TTL only controls the lifetime of the DataLoader instance, not the individual cache entries.
    // The value is chosen arbitrarily to prevent long-running batch loaders as recommended by the documentation
    ttl: 1000 * 60 * 10, // 10 minutes
    getFreshValue: () =>
      new EdgeDataLoader(
        (coinMinimalDenoms: readonly string[]) =>
          queryPrices(coinMinimalDenoms as string[]).then((priceMap) =>
            coinMinimalDenoms.map((baseCoinMinimalDenom) => {
              try {
                const price =
                  priceMap[baseCoinMinimalDenom][QUOTE_COIN_MINIMAL_DENOM];

                // trim to 18 decimals to silence Dec warnings
                const p = price.replace(/(\.\d{18})\d*/, "$1");

                if (isNil(p)) {
                  return new Error(
                    `No SQS price result for ${baseCoinMinimalDenom} and USDC`
                  );
                }

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
          ),
        {
          // SQS imposes a limit on URI length from its Nginx configuration, so we impose a limit to avoid hitting that limit.
          maxBatchSize: 100,
        }
      ),
  });
}
