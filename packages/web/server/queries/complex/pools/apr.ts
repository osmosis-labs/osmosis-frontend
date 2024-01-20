import { RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { ChainList } from "~/config/generated/chain-list";
import { getChainInflation } from "~/server/queries/complex/chain-inflation";
import { estimatePoolAPROsmoEquivalentMultiplier } from "~/server/queries/complex/pools/osmo-equivalent";
import { isPoolSuperfluid } from "~/server/queries/complex/pools/superfluid";

const aprCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getSuperfluidPoolAPR({ poolId }: { poolId: string }) {
  if (!isPoolSuperfluid({ poolId })) return undefined;

  return cachified({
    cache: aprCache,
    key: `superfluid-pool-apr-${poolId}`,
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      const chainInflation = await getChainInflation({
        chainId: ChainList[0].chain_id, // Osmosis chain
      });

      return new RatePretty(
        chainInflation
          .mul(await estimatePoolAPROsmoEquivalentMultiplier({ poolId }))
          .moveDecimalPointLeft(2)
      );
    },
  });
}
