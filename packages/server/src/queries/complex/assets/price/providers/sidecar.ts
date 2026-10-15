import { Asset } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { LRUCache } from "lru-cache";

import {
  getQuotePrice,
  queryPrices,
} from "../../../../../queries/sidecar/prices";
import { EdgeDataLoader } from "../../../../../utils/batching";

// Cache settled values, not rejected promises. In-flight work is deduplicated
// separately so eviction or expiry cannot duplicate an outstanding lookup.
const priceCache = new LRUCache<
  string,
  { value: string | Error; expiresAt: number }
>({ max: 1_500 });
function cachePrice(denom: string, value: string | Error, ttl: number) {
  priceCache.set(denom, { value, expiresAt: Date.now() + ttl });
}
const inFlight = new Map<string, Promise<string>>();

const loader = new EdgeDataLoader<string, string>(
  async (denoms) => {
    try {
      const priceMap = await queryPrices([...denoms]);
      return denoms.map((denom) => {
        let result: string | Error = new Error(
          `No SQS price result for ${denom} and USDC`
        );
        try {
          const price = getQuotePrice(priceMap[denom]);
          if (price !== undefined) {
            const trimmed = price.replace(/(\.\d{18})\d*/, "$1");
            if (new Dec(trimmed).isPositive()) result = trimmed;
          }
        } catch {
          // Invalid prices are unavailable, just like missing or zero prices.
        }
        cachePrice(denom, result, result instanceof Error ? 60_000 : 10_000);
        return result;
      });
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause));
      // Briefly suppress retries during an upstream outage without treating it
      // as evidence that these assets have no route.
      return denoms.map((denom) => {
        cachePrice(denom, error, 10_000);
        return error;
      });
    }
  },
  {
    // SQS's Nginx URI limit requires batches of at most 100 denoms.
    maxBatchSize: 100,
    // The bounded TTL cache above owns retention; DataLoader only batches.
    cache: false,
  }
);

/** Gets a USD price from SQS. Unavailable prices reject rather than return zero. */
export async function getPriceFromSidecar(asset: Asset): Promise<Dec> {
  const denom = asset.coinMinimalDenom;
  const cached = priceCache.get(denom);
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.value instanceof Error) throw cached.value;
    return new Dec(cached.value);
  }
  if (cached) priceCache.delete(denom);

  let pending = inFlight.get(denom);
  if (!pending) {
    pending = loader.load(denom).finally(() => inFlight.delete(denom));
    inFlight.set(denom, pending);
  }
  return new Dec(await pending);
}
