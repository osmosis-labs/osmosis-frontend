import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { EdgeDataLoader } from "../../../utils/batching";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { captureErrorAndReturn, captureIfError } from "../../../utils/error";
import {
  CoingeckoVsCurrencies,
  queryCoingeckoCoin,
  queryCoingeckoCoinIds,
  queryCoingeckoCoins,
} from "../../coingecko";
import {
  queryAllTokenData,
  queryTokenMarketCaps,
  TokenData,
} from "../../data-services";
import { Asset, AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getCoinGeckoPricesBatchLoader } from "./price/providers/coingecko";

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  currentPrice: PricePretty;
  priceChange1h: RatePretty;
  priceChange24h: RatePretty;
  priceChange7d: RatePretty;
  volume24h: PricePretty;
  liquidity: PricePretty;
}>;

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getMarketAsset<TAsset extends Asset>({
  asset,
}: {
  asset: TAsset;
}): Promise<TAsset & AssetMarketInfo> {
  const assetMarket = await cachified({
    cache: marketInfoCache,
    key: `market-asset-${asset.coinMinimalDenom}`,
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const [marketCap, assetMarketActivity] = await Promise.all([
        getAssetMarketCap(asset).catch((e) =>
          captureErrorAndReturn(e, undefined)
        ),
        getAssetMarketActivity(asset).catch((e) =>
          captureErrorAndReturn(e, undefined)
        ),
      ]);

      return {
        currentPrice: assetMarketActivity?.price,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        liquidity: assetMarketActivity?.liquidity,
        priceChange1h: assetMarketActivity?.price1hChange,
        priceChange24h: assetMarketActivity?.price24hChange,
        priceChange7d: assetMarketActivity?.price7dChange,
        volume24h: assetMarketActivity?.volume24h,
      };
    },
  });

  return { ...asset, ...assetMarket };
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetMarketAssets<TAsset extends Asset>({
  assets,
  ...params
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  assets?: TAsset[];
} & AssetFilter): Promise<(TAsset & AssetMarketInfo)[]> {
  if (!assets) assets = getAssets({ ...params }) as TAsset[];

  return await Promise.all(assets.map((asset) => getMarketAsset({ asset })));
}

const assetMarketCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Fetches and caches asset market capitalization. */
async function getAssetMarketCap({
  coinDenom,
  coinGeckoId,
}: {
  coinDenom: string;
  coinGeckoId?: string;
}): Promise<number | undefined> {
  const marketCapsMap = await cachified({
    cache: marketInfoCache,
    key: "assetMarketCaps",
    ttl: 1000 * 20, // 20 seconds
    getFreshValue: async () => {
      const marketCaps = await queryTokenMarketCaps();

      return marketCaps.reduce((map, mCap) => {
        return map.set(mCap.symbol.toUpperCase(), mCap.market_cap);
      }, new Map<string, number>());
    },
  });

  return (
    marketCapsMap.get(coinDenom.toUpperCase()) ??
    (await getCoingeckoCoin({ coinGeckoId }))?.market_cap
  );
}

const assetCoingeckoCoinCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

/** Fetches coingecko coin data. */
export async function getAssetCoingeckoCoin({
  coinGeckoId,
  currency = "usd",
}: {
  coinGeckoId: string;
  currency?: CoingeckoVsCurrencies;
}) {
  return cachified({
    cache: assetCoingeckoCoinCache,
    key: `assetCoingeckoCoinCache-${coinGeckoId}-${currency}`,
    ttl: 1000 * 60 * 30, // 15 minutes
    getFreshValue: async () => {
      const [coingeckoCoin, volumes] = await Promise.all([
        captureIfError(() => queryCoingeckoCoin(coinGeckoId)),
        captureIfError(() =>
          getCoinGeckoPricesBatchLoader({
            currency,
          })
        ),
      ]);

      const volume24h = volumes
        ? (await volumes.load(coinGeckoId)).volume24h
        : undefined;

      return {
        links: coingeckoCoin?.links,
        marketCapRank: coingeckoCoin?.market_cap_rank,
        totalValueLocked: coingeckoCoin?.market_data.total_value_locked?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.total_value_locked.usd)
            )
          : undefined,
        fullyDilutedValuation: coingeckoCoin?.market_data
          .fully_diluted_valuation?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.fully_diluted_valuation.usd)
            )
          : undefined,
        circulatingSupply: coingeckoCoin?.market_data.circulating_supply,
        marketCap: coingeckoCoin?.market_data.market_cap?.usd
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              new Dec(coingeckoCoin?.market_data.market_cap.usd)
            )
          : undefined,
        volume24h:
          volume24h !== undefined
            ? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(volume24h))
            : undefined,
      };
    },
  });
}

/** Fetches general asset info such as price and price change, liquidity, volume, and name
 *  configured outside of our asset list (from data services).
 *  Returns `undefined` for a given coin denom if there was an error or it's not available. */
export async function getAssetMarketActivity({
  coinMinimalDenom,
}: {
  coinMinimalDenom: string;
}) {
  const assetMarketMap = await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 5, // 5 minutes since there's price data
    key: "allTokenData",
    getFreshValue: async () => {
      const allTokenData = await queryAllTokenData();

      const tokenInfoMap = new Map<string, MarketActivity>();
      allTokenData.forEach((tokenData) => {
        const activity = makeMarketActivityFromTokenData(tokenData);
        tokenInfoMap.set(tokenData.denom.toUpperCase(), activity);
      });
      return tokenInfoMap;
    },
  });

  return assetMarketMap.get(coinMinimalDenom.toUpperCase());
}

type MarketActivity = ReturnType<typeof makeMarketActivityFromTokenData>;
/** Converts raw token data to useful types where applicable. */
function makeMarketActivityFromTokenData(tokenData: TokenData) {
  return {
    price:
      tokenData.price !== null
        ? new PricePretty(DEFAULT_VS_CURRENCY, tokenData.price)
        : undefined,
    denom: tokenData.denom,
    symbol: tokenData.symbol,
    liquidity: new PricePretty(DEFAULT_VS_CURRENCY, tokenData.liquidity),
    liquidity24hChange:
      tokenData.liquidity_24h_change !== null
        ? new RatePretty(
            new Dec(tokenData.liquidity_24h_change).quo(new Dec(100))
          )
        : undefined,
    volume24h: new PricePretty(DEFAULT_VS_CURRENCY, tokenData.volume_24h),
    volume24hChange:
      tokenData.volume_24h_change !== null
        ? new RatePretty(new Dec(tokenData.volume_24h_change).quo(new Dec(100)))
        : undefined,
    name: tokenData.name,
    price1hChange:
      tokenData.price_1h_change !== null
        ? new RatePretty(new Dec(tokenData.price_1h_change).quo(new Dec(100)))
        : undefined,
    price24hChange:
      tokenData.price_24h_change !== null
        ? new RatePretty(new Dec(tokenData.price_24h_change).quo(new Dec(100)))
        : undefined,
    price7dChange:
      tokenData.price_7d_change !== null
        ? new RatePretty(new Dec(tokenData.price_7d_change).quo(new Dec(100)))
        : undefined,
    exponent: tokenData.exponent,
    display: tokenData.display,
  };
}

/** Used with `DataLoader` to make batched calls to CoinGecko.
 *  This allows us to provide IDs in a batch to CoinGecko, which is more efficient than making individual calls. */
async function batchFetchCoingeckoCoins(keys: readonly string[]) {
  const coins = await queryCoingeckoCoins(keys as string[]);
  return keys.map(
    (key) =>
      coins.find(({ id }) => id === key) ??
      new Error(`No CoinGecko coin result for ${key}`)
  );
}
const coingeckoCoinBatchLoader = new EdgeDataLoader(batchFetchCoingeckoCoins);

/** Set of active CoinGecko IDs that CoinGecko has data for (is "active"). */
export async function getActiveCoingeckoCoins() {
  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 60, // 1 hour
    key: "coinGeckoIds",
    getFreshValue: () =>
      queryCoingeckoCoinIds().then(
        (coins) => new Set(coins.map(({ id }) => id))
      ),
  });
}

/** Gets the CoinGecko coin object for a given CoinGecko ID.
 *  Returns `undefined` if the token ID is not actively listed on CoinGecko. */
async function getCoingeckoCoin({
  coinGeckoId,
}: {
  coinGeckoId: string | undefined;
}) {
  if (!coinGeckoId) return;

  // Given ID should be supported by CoinGecko
  if (!(await getActiveCoingeckoCoins()).has(coinGeckoId)) return;

  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 5, // 5 minutes
    key: "coingecko-coin-" + coinGeckoId,
    getFreshValue: () => coingeckoCoinBatchLoader.load(coinGeckoId),
  });
}
