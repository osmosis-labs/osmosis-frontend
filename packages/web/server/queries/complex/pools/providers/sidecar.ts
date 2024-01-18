import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { PoolRawResponse } from "~/server/queries/osmosis";
import {
  queryPools,
  UnderlyingConcentratedPool,
  UnderlyingStablePool,
  UnderlyingWeightedPool,
} from "~/server/queries/sidecar";

import { calcSumAssetsValue, getAsset } from "../../assets";
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
      const pools = await Promise.all(
        sidecarPools.map((sidecarPool) => makePoolFromSidecarPool(sidecarPool))
      );
      return pools.filter(Boolean) as Pool[];
    },
  });
}

/** Converts a single SQS pool model response to the standard and more useful Pool type. */
async function makePoolFromSidecarPool(
  sidecarPool: SidecarPool
): Promise<Pool | undefined> {
  const reserveCoins = await getListedReservesFromSidecarPool(sidecarPool);

  // contains unlisted or invalid assets
  if (reserveCoins.length === 0) return;

  return {
    id: getPoolIdFromSidecarPool(sidecarPool.underlying_pool),
    type: getPoolTypeFromSidecarPool(sidecarPool.underlying_pool),
    raw: makePoolRawResponseFromUnderlyingPool(sidecarPool.underlying_pool),
    spreadFactor: new RatePretty(sidecarPool.sqs_model.spread_factor),
    reserveCoins,
    totalFiatValueLocked: await calcTotalFiatValueLockedFromReserve(
      reserveCoins
    ),
  };
}

function getPoolIdFromSidecarPool(
  underlying_pool: SidecarPool["underlying_pool"]
): string {
  return (
    "pool_id" in underlying_pool ? underlying_pool.pool_id : underlying_pool.id
  ).toString();
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
    if (TransmuterPoolCodeIds.includes(underlying_pool.code_id.toString()))
      return "cosmwasm-transmuter";
    else return "cosmwasm";
  }
  throw new Error("Unknown pool type: " + JSON.stringify(underlying_pool));
}

export async function getListedReservesFromSidecarPool(
  sidecarPool: SidecarPool
): Promise<CoinPretty[]> {
  const listedBalances = (
    await Promise.all(
      sidecarPool.sqs_model.pool_denoms.map(async (denom) => {
        const asset = await getAsset({ anyDenom: denom }).catch(() => null);
        // not listed
        if (!asset) return;

        const amount = sidecarPool.sqs_model.balances.find(
          (balance) => balance.denom === denom
        )?.amount;
        // no balance
        if (!amount) return;

        return new CoinPretty(asset, amount);
      })
    )
  ).filter(Boolean) as CoinPretty[];

  // sort denoms per pool type, as SQS returns them in arbitrary order
  const type = getPoolTypeFromSidecarPool(sidecarPool.underlying_pool);
  try {
    if (type === "weighted") {
      const raw = sidecarPool.underlying_pool as UnderlyingWeightedPool;
      return raw.pool_assets.map((asset) => {
        const coin = listedBalances.find(
          ({ currency: { coinMinimalDenom } }) =>
            coinMinimalDenom === asset.token.denom
        );
        if (!coin)
          throw new Error("Missing listed balance for " + asset.token.denom);
        return coin;
      });
    } else if (type === "stable") {
      const raw = sidecarPool.underlying_pool as UnderlyingStablePool;
      return raw.pool_liquidity.map(({ denom }) => {
        const coin = listedBalances.find(
          ({ currency: { coinMinimalDenom } }) => coinMinimalDenom === denom
        );
        if (!coin) throw new Error("Missing listed balance for " + denom);
        return coin;
      });
    } else if (type === "concentrated") {
      const raw = sidecarPool.underlying_pool as UnderlyingConcentratedPool;
      const token0 = listedBalances.find(
        ({ currency: { coinMinimalDenom } }) => coinMinimalDenom === raw.token0
      );
      const token1 = listedBalances.find(
        ({ currency: { coinMinimalDenom } }) => coinMinimalDenom === raw.token1
      );

      if (!token0 || !token1)
        throw new Error("Missing listed balance for CL pool: " + raw.id);

      return [token0, token1];
    }
  } catch (e) {
    // not listed
    return [];
  }

  // all other cases, sorting is unknown/doesn't matter
  return listedBalances;
}

/** Sidecar made some type changes to the underlying pool, so we map those changes back to the sidecar type.  */
function makePoolRawResponseFromUnderlyingPool(
  underlyingPool: SidecarPool["underlying_pool"]
): PoolRawResponse {
  if ("current_tick_liquidity" in underlyingPool) {
    return {
      ...underlyingPool,
      id: underlyingPool.id?.toString(),
      current_tick: underlyingPool.current_tick?.toString(),
      tick_spacing: underlyingPool.tick_spacing?.toString(),
      exponent_at_price_one: underlyingPool.exponent_at_price_one?.toString(),
    } as PoolRawResponse;
  }

  if ("scaling_factors" in underlyingPool) {
    return {
      ...underlyingPool,
      id: underlyingPool.id?.toString(),
      scaling_factors: underlyingPool.scaling_factors?.map((factor) =>
        factor.toString()
      ),
    } as PoolRawResponse;
  }

  if ("id" in underlyingPool) {
    return {
      ...underlyingPool,
      id: underlyingPool.id?.toString(),
    } as PoolRawResponse;
  }

  return {
    ...underlyingPool,
    pool_id: underlyingPool.pool_id?.toString(),
    code_id: underlyingPool.code_id?.toString(),
  } as PoolRawResponse;
}

function calcTotalFiatValueLockedFromReserve(reserve: CoinPretty[]) {
  const assets = reserve.map((coin) => ({
    anyDenom: coin.currency.coinMinimalDenom,
    amount: coin.toCoin().amount,
  }));

  return calcSumAssetsValue({ assets }).then(
    (value) => new PricePretty(DEFAULT_VS_CURRENCY, value ?? 0)
  );
}
