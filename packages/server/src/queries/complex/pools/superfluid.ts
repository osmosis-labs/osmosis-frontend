import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryAllSuperfluidAssets } from "../../../queries/osmosis/superfluid";

const superfluidCache = new LRUCache<string, CacheEntry>({ max: 1 });

export function getSuperfluidPoolIds({ chainList }: { chainList: Chain[] }) {
  return cachified({
    cache: superfluidCache,
    key: "superfluid-pool-ids",
    ttl: 1000 * 60 * 5, // 5 mins
    getFreshValue: async () => {
      const { assets: superfluidAssets } = await queryAllSuperfluidAssets({
        chainList,
      });

      const superfluidPoolIds = new Set<string>();
      for (const asset of superfluidAssets) {
        // superfluid share pool
        if (asset.asset_type === "SuperfluidAssetTypeLPShare") {
          const poolId = asset.denom.split("/")[2];
          superfluidPoolIds.add(poolId);
        }

        // superfluid CL pool
        if (asset.asset_type === "SuperfluidAssetTypeConcentratedShare") {
          const poolId = asset.denom.split("/")[2];
          superfluidPoolIds.add(poolId);
        }
      }

      return Array.from(superfluidPoolIds);
    },
  });
}
