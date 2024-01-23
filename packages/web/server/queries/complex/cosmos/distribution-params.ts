import { RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { queryDistributionParams } from "~/server/queries/cosmos/distribution";

const distributionCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getDistributionParams({ chainId }: { chainId: string }) {
  return cachified({
    cache: distributionCache,
    key: `distribution-params-${chainId}`,
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      const { params } = await queryDistributionParams({ chainId });
      return {
        communityTax: new RatePretty(params.community_tax),
      };
    },
  });
}
