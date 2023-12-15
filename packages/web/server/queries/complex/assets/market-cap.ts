import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryTokenMarketCaps, TokenMarketCap } from "../../indexer";

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
    ttl: 1000 * 60 * 15, // 15 minutes
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
  for (let i = 0; i < marketCaps.length; i++) {
    const rank = i + 1;
    rankMap.set(marketCaps[i].symbol, rank);
  }
  return rankMap;
}
