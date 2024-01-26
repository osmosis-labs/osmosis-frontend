import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { AssetList } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { AssetLists } from "~/config/generated/asset-lists";

import { queryCoingeckoCoin } from "../../coingecko";
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
    getFreshValue: async () => {
      const currentPrice = await getAssetPrice({ asset }).catch(() => {
        // if not found, return undefined
        return;
      });
      const marketCap = (
        await queryTokenMarketCaps().catch(() => {
          // if not found, return undefined
          return undefined;
        })
      )?.find((mCap) => mCap.symbol === asset.coinDenom)?.market_cap;
      const priceChange24h = (await getAssetMarketActivity(asset))
        ?.price_24h_change;
      const marketCapRank = await getAssetMarketCapRank(asset);

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

/** Gets the numerical market cap rank given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */
async function getAssetMarketCapRank({
  coinGeckoId,
}: {
  coinGeckoId: string | undefined;
}): Promise<number | undefined> {
  if (!coinGeckoId) return;

  return await cachified({
    cache: assetMarketCache,
    ttl: 1000 * 60 * 15, // 15 minutes since market ranks don't change often
    key: "market-cap-" + coinGeckoId,
    getFreshValue: async () => {
      try {
        const coinGeckoCoin = await queryCoingeckoCoin(coinGeckoId);

        return coinGeckoCoin.market_cap_rank;
      } catch {
        // ignore error and return undefined, since market cap rank is non-critical
      }
    },
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
