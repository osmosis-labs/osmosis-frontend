import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { EdgeDataLoader } from "../../../utils/batching";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { captureErrorAndReturn } from "../../../utils/error";
import { queryCoingeckoCoinIds, queryCoingeckoCoins } from "../../coingecko";
import {
  queryAllTokenData,
  queryTokenMarketCaps,
  TokenData,
} from "../../data-services";
import { Asset, AssetFilter, getAssets } from ".";
import { DEFAULT_VS_CURRENCY } from "./config";
import { getAssetPrice } from "./price";

export type AssetMarketInfo = Partial<{
  marketCap: PricePretty;
  marketCapRank: number;
  currentPrice: PricePretty;
  priceChange24h: RatePretty;
  volume24h: PricePretty;
}>;

const marketInfoCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Cached function that returns an asset with market info included. */
export async function getMarketAsset<TAsset extends Asset>({
  assetLists,
  chainList,
  asset,
}: {
  assetLists: AssetList[];
  chainList: Chain[];
  asset: TAsset;
}): Promise<TAsset & AssetMarketInfo> {
  const assetMarket = await cachified({
    cache: marketInfoCache,
    key: `market-asset-${asset.coinMinimalDenom}`,
    ttl: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const [currentPrice, marketCap, assetMarketActivity, coingeckoCoin] =
        await Promise.all([
          getAssetPrice({ assetLists, chainList, asset }).catch((e) =>
            captureErrorAndReturn(e, undefined)
          ),
          getAssetMarketCap(asset).catch((e) =>
            captureErrorAndReturn(e, undefined)
          ),
          getAssetMarketActivity(asset).catch((e) =>
            captureErrorAndReturn(e, undefined)
          ),
          getCoingeckoCoin(asset).catch((e) =>
            captureErrorAndReturn(e, undefined)
          ),
        ]);

      const marketCapRank = coingeckoCoin?.market_cap_rank;

      return {
        currentPrice: currentPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, currentPrice)
          : undefined,
        marketCap: marketCap
          ? new PricePretty(DEFAULT_VS_CURRENCY, marketCap)
          : undefined,
        marketCapRank,
        priceChange24h: assetMarketActivity?.price24hChange,
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

  return await Promise.all(
    assets.map((asset) => getMarketAsset({ ...params, asset }))
  );
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
    ttl: 1000 * 20, // 20 seconds
    getFreshValue: async () => {
      const marketCaps = await queryTokenMarketCaps();

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
export async function getAssetMarketActivity({
  coinDenom,
}: {
  coinDenom: string;
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
        tokenInfoMap.set(tokenData.symbol, activity);
      });
      return tokenInfoMap;
    },
  });

  return assetMarketMap.get(coinDenom);
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
    price24hChange:
      tokenData.price_24h_change !== null
        ? new RatePretty(new Dec(tokenData.price_24h_change).quo(new Dec(100)))
        : undefined,
    exponent: tokenData.exponent,
    display: tokenData.display,
  };
}
