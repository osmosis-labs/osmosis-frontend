import { RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryDistributionParams } from "~/server/queries/cosmos/distribution";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const distributionCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getDistributionParams({ chainId }: { chainId: string }) {
  return cachified({
    cache: distributionCache,
    key: `distribution-params-${chainId}`,
    ttl: 1000 * 30, // 30 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const { params } = await queryDistributionParams({ chainId });
      return {
        communityTax: new RatePretty(params.community_tax),
      };
    },
  });
}
