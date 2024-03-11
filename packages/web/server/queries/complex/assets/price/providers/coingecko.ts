import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "~/server/queries/coingecko";
import { EdgeDataLoader } from "~/utils/batching";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const coinGeckoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Gets asset price from CoinGecko. Tries to search for CoinGecko ID if not provided.
 *  @throws If no CoinGecko ID is configured or can be found from searching with symbol. */
export async function getPriceFromCoinGecko(
  asset: Asset,
  currency: CoingeckoVsCurrencies = "usd"
) {
  let coinGeckoId = asset.coingeckoId;

  if (!coinGeckoId) {
    coinGeckoId = await searchCoinGeckoCoinId({ symbol: asset.symbol });
  }

  if (!coinGeckoId) {
    throw new Error(`No CoinGecko ID found for ${asset.symbol}`);
  }

  return getCoingeckoPrice({ coinGeckoId, currency });
}

/** Used with `DataLoader` to make batched calls to CoinGecko.
 *  This allows us to provide IDs in a batch to CoinGecko, which is more efficient than making individual calls. */
async function batchFetchCoingeckoPrices(
  coinGeckoIds: readonly string[],
  currency: CoingeckoVsCurrencies
) {
  const pricesObject = await querySimplePrice(coinGeckoIds as string[], [
    currency,
  ]);
  return coinGeckoIds.map(
    (key) =>
      pricesObject[key][currency] ??
      new Error(`No CoinGecko price result for ${key} and ${currency}`)
  );
}
export async function getCoingeckoPrice({
  coinGeckoId,
  currency,
}: {
  coinGeckoId: string;
  currency: CoingeckoVsCurrencies;
}) {
  // Create a loader per given currency.
  const currencyBatchLoader = await cachified({
    cache: coinGeckoCache,
    key: `prices-batch-loader-${currency}`,
    getFreshValue: async () => {
      return new EdgeDataLoader((ids: readonly string[]) =>
        batchFetchCoingeckoPrices(ids, currency)
      );
    },
  });

  // Cache a result per CoinGecko ID *and* currency ID.
  return cachified({
    cache: coinGeckoCache,
    key: `coingecko-price-${coinGeckoId}-${currency}`,
    ttl: 1000 * 60, // 1 minute
    getFreshValue: () =>
      currencyBatchLoader.load(coinGeckoId).then((price) => new Dec(price)),
  });
}

/** Cached CoinGecko ID for needs of price function. */
export async function searchCoinGeckoCoinId({ symbol }: { symbol: string }) {
  return cachified({
    cache: coinGeckoCache,
    key: `coingecko-coin-${symbol}`,
    ttl: 1000 * 60 * 60, // 1 hour since the coin api ID won't change often
    getFreshValue: async () =>
      queryCoingeckoSearch(symbol).then(
        ({ coins }) =>
          coins?.find(
            ({ symbol: symbol_ }) =>
              symbol_?.toLowerCase() === symbol.toLowerCase()
          )?.api_symbol
      ),
  });
}
