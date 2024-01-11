import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryPools } from "~/server/queries/sidecar";

import { calcAssetValue, getAsset } from "../../assets";
import { DEFAULT_VS_CURRENCY } from "../../assets/config";
import { TransmuterPoolCodeIds } from "../env";
import { Pool, PoolType } from "../index";

type SidecarPool = Awaited<ReturnType<typeof queryPools>>[number];

const poolsCache = new LRUCache<string, CacheEntry>({ max: 1 });

/** Lightly cached pools from sidecar service. */
export function getPoolsFromSidecar(): Promise<Pool[]> {
  return cachified({
    cache: poolsCache,
    key: "sidecar-pools",
    ttl: 1000, // 1 second
    getFreshValue: async () => {
      const sidecarPools = await queryPools();
      return await Promise.all(
        sidecarPools.map((sidecarPool) => makePoolFromSidecarPool(sidecarPool))
      );
    },
  });
}

async function makePoolFromSidecarPool(
  sidecarPool: SidecarPool
): Promise<Pool> {
  const assetValueDec =
    (await calcAssetValue({
      anyDenom: "uosmo",
      amount: sidecarPool.sqs_model.total_value_locked_uosmo,
    })) ?? new Dec(0);

  return {
    id: getPoolIdFromSidecarPool(sidecarPool.underlying_pool),
    type: getPoolTypeFromSidecarPool(sidecarPool.underlying_pool),
    raw: sidecarPool.underlying_pool,
    reserveCoins: await getListedReservesFromSidecarPool(sidecarPool),
    totalFiatValueLocked: new PricePretty(DEFAULT_VS_CURRENCY, assetValueDec),
  };
}

function getPoolIdFromSidecarPool(
  underlying_pool: SidecarPool["underlying_pool"]
): string {
  if ("pool_id" in underlying_pool) return underlying_pool.pool_id;
  else return underlying_pool.id;
}

// since type URL was removed from underlying_pool in sidecar response
// we use the different shapes of the pool model to derive the pool type
export function getPoolTypeFromSidecarPool(
  underlying_pool: SidecarPool["underlying_pool"]
): PoolType {
  if ("pool_assets" in underlying_pool) return "weighted";
  if ("scaling_factors" in underlying_pool) return "stable";
  if ("current_sqrt_price" in underlying_pool) return "concentrated";
  if ("code_id" in underlying_pool) {
    if (TransmuterPoolCodeIds.includes(underlying_pool.code_id))
      return "cosmwasm-transmuter";
    else return "cosmwasm";
  }
  throw new Error("Unknown pool type: " + JSON.stringify(underlying_pool));
}

async function getListedReservesFromSidecarPool(
  sidecarPool: SidecarPool
): Promise<CoinPretty[]> {
  const balances = sidecarPool.sqs_model.balances.filter(({ denom }) =>
    // only include balances in pool, as anyone can send arbitrary tokens to a pool account
    sidecarPool.sqs_model.pool_denoms.includes(denom)
  );

  return (
    await Promise.all(
      balances.map(async (balance) => {
        const asset = await getAsset({ anyDenom: balance.denom }).catch(
          () => null
        );
        // not listed
        if (!asset) return;
        return new CoinPretty(asset, balance.amount);
      })
    )
  ).filter(Boolean) as CoinPretty[];
}
