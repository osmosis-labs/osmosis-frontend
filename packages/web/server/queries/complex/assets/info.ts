import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryAllTokenData,
  queryTokenMarketCaps,
  TokenData,
  TokenMarketCap,
} from "../../indexer";

const marketCapsCache = new LRUCache<string, CacheEntry>({ max: 1 });
/** Gets the numerical market cap rank based on the available market caps given a token symbol/denom.
 *  Returns `undefined` if a market cap is not available for the given symbol/denom. */
export async function getAssetMarketCapRank({
  coinDenom,
}: {
  coinDenom: string;
}): Promise<number | undefined> {
  const rankMap: Map<string, number> = await cachified({
    cache: marketCapsCache,
    ttl: 1000 * 60 * 15, // 15 minutes since market ranks don't change often
    key: "marketCapRankMap",
    getFreshValue: async () => {
      try {
        const marketCaps = await queryTokenMarketCaps();

        return calculateRank(marketCaps);
      } catch (error) {
        console.error("Could not fetch market caps for ranking", error);
        return new Map<string, number>();
      }
    },
  });

  return rankMap.get(coinDenom);
}

export function calculateRank(marketCaps: TokenMarketCap[]) {
  const rankMap = new Map<string, number>();
  marketCaps.sort((a, b) => b.market_cap - a.market_cap);

  let rank = 1;
  for (let i = 0; i < marketCaps.length; i++) {
    if (i > 0 && marketCaps[i].market_cap !== marketCaps[i - 1].market_cap) {
      rank++;
    }
    rankMap.set(marketCaps[i].symbol, rank);
  }

  return rankMap;
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
