import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { AssetLists } from "~/config/generated/asset-lists";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

import { EdgeDataLoader } from "../../base-utils";
import { queryCoingeckoCoinIds, queryCoingeckoCoins } from "../../coingecko";
import {
  queryAllTokenData,
  queryTokenMarketCaps,
  TokenData,
} from "../../imperator";
import { Asset, AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getAssetPrice } from "./price";

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  marketCapRank: number;
  currentPrice: PricePretty;
  priceChange24h: RatePretty;
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
    key: asset.coinDenom + asset.coinMinimalDenom,
    ttl: 1000 * 60 * 5, // 5 minutes
    staleWhileRevalidate: 1000 * 60 * 10, // 10 mins
    getFreshValue: async () => {
      const currentPrice = await getAssetPrice({ asset }).catch(() => null);
      const marketCap = await getAssetMarketCap(asset).catch(() => null);
      const priceChange24h = (await getAssetMarketActivity(asset))
        ?.price_24h_change;
      const marketCapRank = (await getCoingeckoCoin(asset).catch(() => null))
        ?.market_cap_rank;

      return {
        currentPrice: currentPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, currentPrice)
          : undefined,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        marketCapRank,
        priceChange24h: priceChange24h
          ? new RatePretty(new Dec(priceChange24h).quo(new Dec(100)))
          : undefined,
      };
    },
  });

  return { ...asset, ...assetMarket };
}

/** Maps and adds general supplementary market data such as current price and market cap to the given type.
 *  If no assets provided, they will be fetched and passed the given search params. */
export async function mapGetMarketAssets<TAsset extends Asset>({
  assetList = AssetLists,
  ...params
}: {
  assetList?: AssetList[];
  assets?: TAsset[];
} & AssetFilter = {}): Promise<(TAsset & AssetMarketInfo)[]> {
  let { assets } = params;
  if (!assets) assets = (await getAssets(params)) as TAsset[];

  return await Promise.all(assets.map((asset) => getMarketAsset({ asset })));
}

const assetMarketCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Fetches and caches asset market capitalization. */
async function getAssetMarketCap({
  coinDenom,
}: {
  coinDenom: string;
}): Promise<number | undefined> {
  const marketCapsMap = await cachified({
    cache: marketInfoCache,
    key: "assetMarketCaps",
    ttl: 1000 * 60 * 30, // 30 minutes
    getFreshValue: async () => {
      const marketCaps = await queryTokenMarketCaps();

      if (!marketCaps) return new Map<string, number>();
      return marketCaps.reduce((map, mCap) => {
        return map.set(mCap.symbol, mCap.market_cap);
      }, new Map<string, number>());
    },
  });

  return marketCapsMap.get(coinDenom);
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

/** Gets the CoinGecko coin object for a given CoinGecko ID.
 *  Returns `undefined` if the token ID is not actively listed on CoinGecko. */
async function getCoingeckoCoin({
  coinGeckoId,
}: {
  coinGeckoId: string | undefined;
}) {
  if (!coinGeckoId) return;

  // Given ID should be supported by CoinGecko
  if (
    !(await getActiveCoingeckoCoins()).some((coin) => coin.id === coinGeckoId)
  )
    return;

  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 5, // 5 minutes
    key: "coingecko-coin-" + coinGeckoId,
    getFreshValue: () => coingeckoCoinBatchLoader.load(coinGeckoId),
  });
}

async function getActiveCoingeckoCoins() {
  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 60, // 1 hour
    key: "coinGeckoIds",
    getFreshValue: queryCoingeckoCoinIds,
  });
}

/** Fetches general asset info such as price and price change, liquidity, volume, and name
 *  configured outside of our asset list (from data services).
 *  Returns `undefined` for a given coin denom if there was an error or it's not available. */
async function getAssetMarketActivity({ coinDenom }: { coinDenom: string }) {
  const assetMarketMap = await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 5, // 5 minutes since there's price data
    key: "allTokenData",
    getFreshValue: async () => {
      try {
        const allTokenData = await queryAllTokenData();

        const tokenInfoMap = new Map<string, TokenData>();
        allTokenData.forEach((tokenData) => {
          tokenInfoMap.set(tokenData.symbol, tokenData);
        });
        return tokenInfoMap;
      } catch (error) {
        console.error("Could not fetch token infos", error);
        return new Map<string, TokenData>();
      }
    },
  });

  return assetMarketMap.get(coinDenom);
}
