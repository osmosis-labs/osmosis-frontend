import { Asset } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { isNil } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  getQuotePrice,
  queryPrices,
} from "../../../../../queries/sidecar/prices";
import { EdgeDataLoader } from "../../../../../utils/batching";
import { LARGE_LRU_OPTIONS } from "../../../../../utils/cache";

const sidecarCache = new LRUCache<string, CacheEntry>(LARGE_LRU_OPTIONS);

/** SQS route-searches every denom it has no cached price for, so hundreds of
 *  denoms sent as parallel batches can exhaust its memory. Batches beyond this
 *  many wait for a free slot. */
const MAX_CONCURRENT_PRICE_BATCHES = 2;
/** Time a batch gets from joining the queue, waiting included. Below the 12s
 *  tRPC procedure timeout, after which nobody is waiting for the answer, so a
 *  stuck or abandoned burst can't hold slots that later requests need. */
const PRICE_BATCH_DEADLINE_MS = 10_000;

let activePriceBatches = 0;
const waitingPriceBatches: (() => void)[] = [];

async function queryPricesLimited(coinMinimalDenoms: string[]) {
  const deadline = Date.now() + PRICE_BATCH_DEADLINE_MS;

  if (activePriceBatches < MAX_CONCURRENT_PRICE_BATCHES) {
    activePriceBatches++;
  } else {
    // The releasing batch hands its slot over, so the count stays the same.
    await new Promise<void>((resolve) => waitingPriceBatches.push(resolve));
  }

  try {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new Error("SQS price batch expired while queued");
    }
    return await queryPrices(coinMinimalDenoms, {
      signal: AbortSignal.timeout(remainingMs),
    });
  } finally {
    const next = waitingPriceBatches.shift();
    if (next) next();
    else activePriceBatches--;
  }
}

/** Gets price from SQS query server. Currently only supports prices in USDC with decimals. Falls back to pools then querying CoinGecko if not available.
 *  @throws if there's an issue getting the price. */
export function getPriceFromSidecar(asset: Asset) {
  return getBatchLoader().then((loader) =>
    loader.load(asset.coinMinimalDenom).then((price) => new Dec(price))
  );
}

/** Prevent long-running batch loaders as recommended by `DataLoader` docs. */
function getBatchLoader() {
  return cachified({
    cache: sidecarCache,
    key: "sidecar-batch-loader",
    // This TTL only controls the lifetime of the DataLoader instance. The loader doesn't
    // memoize (`cache: false`), so prices are cached only by `getAssetPrice`.
    // The value is chosen arbitrarily to prevent long-running batch loaders as recommended by the documentation
    ttl: 1000 * 60 * 10, // 10 minutes
    getFreshValue: () =>
      new EdgeDataLoader(
        (coinMinimalDenoms: readonly string[]) =>
          queryPricesLimited(coinMinimalDenoms as string[]).then((priceMap) =>
            coinMinimalDenoms.map((baseCoinMinimalDenom) => {
              try {
                // Accepts the current or legacy quote key: sidecar flips its
                // quote denom on restart, independently of this deploy.
                const price = getQuotePrice(priceMap[baseCoinMinimalDenom]);

                if (isNil(price)) {
                  return new Error(
                    `No SQS price result for ${baseCoinMinimalDenom} and USDC`
                  );
                }

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
          // Batch only. Memoizing would hold each price, and each failed price, for the
          // loader's 10 minute lifetime instead of the 10s price TTL.
          cache: false,
          // SQS imposes a limit on URI length from its Nginx configuration, so we impose a limit to avoid hitting that limit.
          maxBatchSize: 100,
        }
      ),
  });
}
