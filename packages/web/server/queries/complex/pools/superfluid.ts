import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { queryAllSuperfluidAssets } from "~/server/queries/osmosis/superfluid";

const superfluidCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function isPoolSuperfluid({ poolId }: { poolId: string }) {
  return cachified({
    cache: superfluidCache,
    key: `is-pool-superfluid-${poolId}`,
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      const { assets: superfluidAssets } = await queryAllSuperfluidAssets();

      for (const asset of superfluidAssets) {
        // superfluid share pool
        if (
          asset.asset_type === "SuperfluidAssetTypeLPShare" &&
          asset.denom === `gamm/pool/${poolId}`
        ) {
          return true;
        }

        // superfluid CL pool
        if (
          asset.asset_type === "SuperfluidAssetTypeConcentratedShare" &&
          asset.denom === `cl/pool/${poolId}`
        ) {
          return true;
        }
      }

      return false;
    },
  });
}
