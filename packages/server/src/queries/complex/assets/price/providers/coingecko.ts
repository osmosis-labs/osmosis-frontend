import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { LRUCache } from "lru-cache";

import { EdgeDataLoader } from "../../../../../utils/batching";
import { DEFAULT_LRU_OPTIONS } from "../../../../../utils/cache";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoSearch,
  querySimplePrice,
} from "../../../../coingecko";
import { queryMarketChart } from "../../../../coingecko";
import { DEFAULT_VS_CURRENCY } from "../../config";

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

interface GetCoinGeckoCoinMarketChartProps {
  id: string;
  timeFrame:
    | string
    | {
        from: number;
        to: number;
      };
  vsCurrency?: string;
}

/** Cached CoinGecko ID for needs of price function. */
export async function getCoinGeckoCoinMarketChart(
  props: GetCoinGeckoCoinMarketChartProps
) {
  const { vsCurrency = DEFAULT_VS_CURRENCY.currency, timeFrame, id } = props;

  let from: dayjs.Dayjs | undefined = dayjs(new Date());
  const to = dayjs(new Date());

  if (typeof timeFrame === "string") {
    /**
     * We set the range of data to be displayed by type
     */
    switch (timeFrame) {
      case "1h":
        from = from.subtract(1, "hour");
        break;
      case "1d":
        from = from.subtract(1, "day");
        break;
      case "7d":
        from = from.subtract(1, "week");
        break;
      case "1mo":
        from = from.subtract(1, "month");
        break;
      case "1y":
        from = from.subtract(1, "year");
        break;
      case "all":
        from = undefined;
        break;
    }
  }

  const fromTimestamp =
    typeof timeFrame === "string" ? from?.unix() ?? 0 : timeFrame.from;
  const toTimestamp = typeof timeFrame === "string" ? to?.unix() : timeFrame.to;

  return cachified({
    cache: coinGeckoCache,
    key: `coingecko-coin-market-chart-${id}-${from?.unix()}-${to.unix()}-${vsCurrency}`,
    ttl: 1,
    getFreshValue: async () =>
      queryMarketChart({
        id,
        vsCurrency,
        to: toTimestamp,
        from: fromTimestamp,
      }),
  });
}
