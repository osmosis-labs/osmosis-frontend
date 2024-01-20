import { RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "~/config/cache";
import { ChainList } from "~/config/generated/chain-list";
import { getChainInflation } from "~/server/queries/complex/chain-inflation";
import { estimatePoolAPROsmoEquivalentMultiplier } from "~/server/queries/complex/pools/osmo-equivalent";
import { isPoolSuperfluid } from "~/server/queries/complex/pools/superfluid";
import { queryPriceRangeApr } from "~/server/queries/imperator";

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

export function getConcentratedRangePoolApr({
  poolId,
  upperTick,
  lowerTick,
}: {
  poolId: string;
  lowerTick: string;
  upperTick: string;
}): Promise<RatePretty | undefined> {
  return cachified({
    cache: aprCache,
    key: `concentrated-pool-apr-${poolId}-${lowerTick}-${upperTick}`,
    ttl: 30 * 1000, // 30 seconds
    getFreshValue: async () => {
      try {
        const { APR } = await queryPriceRangeApr({
          lowerTickIndex: lowerTick,
          upperTickIndex: upperTick,
          poolId: poolId,
        });
        const apr = APR / 100;
        if (isNaN(apr)) return;
        return new RatePretty(apr);
      } catch {
        return undefined;
      }
    },
  });
}
