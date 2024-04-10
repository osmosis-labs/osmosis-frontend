import { Dec } from "@keplr-wallet/unit";
import { Asset, AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryPrices,
  QUOTE_COIN_MINIMAL_DENOM,
} from "../../../../../queries/sidecar/prices";
import { EdgeDataLoader } from "../../../../../utils/batching";
import { LARGE_LRU_OPTIONS } from "../../../../../utils/cache";
import { captureError } from "../../../../../utils/error";
import { getPriceFromPools } from "./pools";

const sidecarCache = new LRUCache<string, CacheEntry>(LARGE_LRU_OPTIONS);

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to pools then querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(
  assetLists: AssetList[],
  chainList: Chain[],
  asset: Asset
) {
  return getBatchLoader().then((loader) =>
    loader
      .load(asset.coinMinimalDenom)
      .then((price) => new Dec(price))
      .catch((e) => {
        captureError(e);
        return getPriceFromPools(assetLists, chainList, asset);
      })
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
