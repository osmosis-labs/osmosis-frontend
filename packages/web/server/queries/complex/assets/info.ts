import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";

import { queryCoingeckoCoin } from "../../coingecko";
import { queryAllTokenData, TokenData } from "../../imperator";

const marketCapsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
/** Gets the numerical market cap rank given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */
export async function getAssetMarketCapRank({
  coinGeckoId,
}: {
  coinGeckoId: string | undefined;
}): Promise<number | undefined> {
  if (!coinGeckoId) return;

  return await cachified({
    cache: marketCapsCache,
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

const allTokenDataCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Fetches general asset info such as price and price change, liquidity, volume, and name
 *  configured outside of our asset list (from data services).
 *  Returns `undefined` for a given coin denom if there was an error or it's not available. */
export async function getAssetData({ coinDenom }: { coinDenom: string }) {
  const tokenInfoMap = await cachified({
    cache: allTokenDataCache,
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

  return tokenInfoMap.get(coinDenom);
}
