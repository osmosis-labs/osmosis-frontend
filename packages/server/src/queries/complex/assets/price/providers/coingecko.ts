import { Dec } from "@osmosis-labs/unit";
import { LRUCache } from "lru-cache";

import { EdgeDataLoader } from "../../../../../utils/batching";
import { DEFAULT_LRU_OPTIONS } from "../../../../../utils/cache";
import { cached, type CacheEntry } from "../../../../../utils/cached";
import { getRequestScoped } from "../../../../../utils/request-scope";
import { CoingeckoVsCurrencies, querySimplePrice } from "../../../../coingecko";

const coinGeckoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Used with `DataLoader` to make batched calls to CoinGecko.
 *  This allows us to provide IDs in a batch to CoinGecko, which is more efficient than making individual calls. */
async function batchFetchCoingeckoPrices(
  coinGeckoIds: readonly string[],
  currency: CoingeckoVsCurrencies
) {
  const pricesObject = await querySimplePrice(coinGeckoIds as string[], [
    currency,
  ]);

  return coinGeckoIds.map((key) => {
    // CoinGecko leaves unknown ids out of the response; fail only that id.
    const price = pricesObject[key]?.[currency];
    if (price) {
      return {
        price,
        volume24h: pricesObject[key].usd_24h_vol,
      };
    }

    return new Error(`No CoinGecko price result for ${key} and ${currency}`);
  });
}

function createPricesBatchLoader(currency: CoingeckoVsCurrencies) {
  // Batch only, so prices are cached only by `getCoingeckoPrice` (1 minute).
  return new EdgeDataLoader(
    (ids: readonly string[]) => batchFetchCoingeckoPrices(ids, currency),
    { cache: false }
  );
}

type PricesBatchLoader = ReturnType<typeof createPricesBatchLoader>;

const batchLoadersSlot = {};

/** One loader per currency. On Workers also one per request: a batch started by one
 *  request can't settle in another (see `request-scope.ts`). */
export async function getCoinGeckoPricesBatchLoader({
  currency,
}: {
  currency: CoingeckoVsCurrencies;
}) {
  const requestLoaders = getRequestScoped(
    batchLoadersSlot,
    () => new Map<CoingeckoVsCurrencies, PricesBatchLoader>()
  );
  if (requestLoaders) {
    let loader = requestLoaders.get(currency);
    if (!loader) {
      loader = createPricesBatchLoader(currency);
      requestLoaders.set(currency, loader);
    }
    return loader;
  }

  return cached({
    cache: coinGeckoCache,
    key: `prices-batch-loader-${currency}`,
    // Only the lifetime of the DataLoader instance, to prevent long-running batch loaders.
    ttl: 1000 * 60 * 10, // 10 minutes
    getFreshValue: async () => createPricesBatchLoader(currency),
  });
}

/** NOTE: Cached for 1 minute
 *  Gets batched prices from CoinGecko by CoinGecko ID. */
export async function getCoingeckoPrice({
  coinGeckoId,
  currency,
}: {
  coinGeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  // Create a loader per given currency.
  const currencyBatchLoader = await getCoinGeckoPricesBatchLoader({ currency });

  // Cache a result per CoinGecko ID *and* currency ID.
  return cached({
    cache: coinGeckoCache,
    key: `coingecko-price-${coinGeckoId}-${currency}`,
    ttl: 1000 * 60, // 1 minute
    getFreshValue: () =>
      currencyBatchLoader.load(coinGeckoId).then((stat) => new Dec(stat.price)),
  });
}
