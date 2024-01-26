import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { PoolRawResponse } from "~/server/queries/osmosis";
import { queryPools } from "~/server/queries/sidecar";

import { calcSumAssetsValue, getAsset } from "../../assets";
import { DEFAULT_VS_CURRENCY } from "../../assets/config";
import { AstroportPclPoolCodeIds, TransmuterPoolCodeIds } from "../env";
import { Pool, PoolType } from "../index";

type SidecarPool = Awaited<ReturnType<typeof queryPools>>[number];

const poolsCache = new LRUCache<string, CacheEntry>({ max: 1 });

/** Lightly cached pools from sidecar service. */
export function getPoolsFromSidecar({
  poolIds,
}: {
  poolIds?: string[];
} = {}): Promise<Pool[]> {
  return cachified({
    cache: poolsCache,
    key: poolIds ? `sidecar-pools-${poolIds.join(",")}` : "sidecar-pools",
    ttl: 1000, // 1 second
    getFreshValue: async () => {
      const sidecarPools = await queryPools({ poolIds });
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
  const reserveCoins = await getListedReservesFromSidecarPool(
    sidecarPool
  ).catch(() => null);

  // contains unlisted or invalid assets
  if (!reserveCoins) return;

  return {
    id: getPoolIdFromChainPool(sidecarPool.chain_model),
    type: getPoolTypeFromChainPool(sidecarPool.chain_model),
    raw: makePoolRawResponseFromChainPool(sidecarPool.chain_model),
    spreadFactor: new RatePretty(sidecarPool.spread_factor),
    reserveCoins,
    totalFiatValueLocked: await calcTotalFiatValueLockedFromReserve(
      reserveCoins
    ),
  };
}

function getPoolIdFromChainPool(
  chain_model: SidecarPool["chain_model"]
): string {
  return (
    "pool_id" in chain_model ? chain_model.pool_id : chain_model.id
  ).toString();
}

// since type URL was removed from chain_model in sidecar response
// we use the different shapes of the pool model to derive the pool type
export function getPoolTypeFromChainPool(
  chain_model: SidecarPool["chain_model"]
): PoolType {
  if ("pool_assets" in chain_model) return "weighted";
  if ("scaling_factors" in chain_model) return "stable";
  if ("current_sqrt_price" in chain_model) return "concentrated";
  if ("code_id" in chain_model) {
    if (TransmuterPoolCodeIds.includes(chain_model.code_id.toString()))
      return "cosmwasm-transmuter";
    if (AstroportPclPoolCodeIds.includes(chain_model.code_id.toString()))
      return "cosmwasm-astroport-pcl";
    else return "cosmwasm";
  }
  throw new Error("Unknown pool type: " + JSON.stringify(chain_model));
}

/** @throws if an asset is unlisted */
export async function getListedReservesFromSidecarPool(
  sidecarPool: SidecarPool
): Promise<CoinPretty[]> {
  const poolDenoms = getPoolDenomsFromSidecarPool(sidecarPool);
  const listedBalances = await Promise.all(
    poolDenoms.map(async (denom) => {
      const asset = await getAsset({ anyDenom: denom }).catch(() => null);
      // not listed
      if (!asset) throw new Error("Asset not listed: " + denom);

      const amount = sidecarPool.balances.find(
        (balance) => balance.denom === denom
      )?.amount;
      // no balance
      if (!amount) throw new Error("No balance for asset: " + denom);

      return new CoinPretty(asset, amount);
    })
  );

  return listedBalances as CoinPretty[];
}

function getPoolDenomsFromSidecarPool({ chain_model, balances }: SidecarPool) {
  if ("pool_assets" in chain_model) {
    return chain_model.pool_assets.map((asset) => asset.token.denom);
  }

  if ("pool_liquidity" in chain_model) {
    return chain_model.pool_liquidity.map(({ denom }) => denom);
  }

  if ("token0" in chain_model) {
    return [chain_model.token0, chain_model.token1];
  }

  // this only works if balances from endpoint only contain balances for assets
  // traded in that pool
  return balances.map(({ denom }) => denom);
}

/** Sidecar made some type changes to the underlying pool, so we map those changes back to the sidecar type.  */
function makePoolRawResponseFromChainPool(
  chainPool: SidecarPool["chain_model"]
): PoolRawResponse {
  if ("current_tick_liquidity" in chainPool) {
    return {
      ...chainPool,
      id: chainPool.id?.toString(),
      current_tick: chainPool.current_tick?.toString(),
      tick_spacing: chainPool.tick_spacing?.toString(),
      exponent_at_price_one: chainPool.exponent_at_price_one?.toString(),
    } as PoolRawResponse;
  }

  if ("scaling_factors" in chainPool) {
    return {
      ...chainPool,
      id: chainPool.id?.toString(),
      scaling_factors: chainPool.scaling_factors?.map((factor) =>
        factor.toString()
      ),
    } as PoolRawResponse;
  }

  if ("id" in chainPool) {
    return {
      ...chainPool,
      id: chainPool.id?.toString(),
    } as PoolRawResponse;
  }

  return {
    ...chainPool,
    pool_id: chainPool.pool_id?.toString(),
    code_id: chainPool.code_id?.toString(),
  } as PoolRawResponse;
}

function calcTotalFiatValueLockedFromReserve(reserve: CoinPretty[]) {
  const assets = reserve.map((coin) => ({
    anyDenom: coin.currency.coinMinimalDenom,
    amount: coin.toCoin().amount,
  }));

  return calcSumAssetsValue({ assets })
    .then((value) => new PricePretty(DEFAULT_VS_CURRENCY, value ?? 0))
    .catch(() => new PricePretty(DEFAULT_VS_CURRENCY, 0));
}
