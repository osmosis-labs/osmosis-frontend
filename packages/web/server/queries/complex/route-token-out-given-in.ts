import { Dec } from "@keplr-wallet/unit";
import {
  CONCENTRATED_LIQ_POOL_TYPE,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  COSMWASM_POOL_TYPE,
  CosmwasmPoolRaw,
  FetchTickDataProvider,
  OptimizedRoutes,
  STABLE_POOL_TYPE,
  StablePool,
  StablePoolRaw,
  Token,
  TransmuterPool,
  WEIGHTED_POOL_TYPE,
  WeightedPool,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";

import { ChainList } from "~/config/generated/chain-list";

import { queryNumPools } from "../osmosis";
import { queryPaginatedPools } from "./pools";

/**
 * This function routes a given token to a specified output token denomination.
 * It fetches the router, gets a quote for the route and retrieves candidate routes.
 *
 * @param token - The token to be routed.
 * @param tokenOutDenom - The output token denomination.
 * @returns Returns a promise that resolves with the quote and candidate routes. */
export async function routeTokenOutGivenIn(
  token: Token,
  tokenOutDenom: string
) {
  // get quote
  const router = await getRouter();
  const quote = await router.routeByTokenIn(token, tokenOutDenom);
  const candidateRoutes = router.getCandidateRoutes(token.denom, tokenOutDenom);

  return {
    quote,
    candidateRoutes,
  };
}

export async function getRouter(): Promise<OptimizedRoutes> {
  // fetch pool data
  const numPoolsResponse = await queryNumPools();
  const poolsResponse = await queryPaginatedPools({
    page: 1,
    limit: Number(numPoolsResponse.num_pools),
    minimumLiquidity: 1000,
  });

  // create routable pool impls from response
  const routablePools = poolsResponse.pools
    .map((pool) => {
      if (pool["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
        pool = pool as ConcentratedLiquidityPoolRaw;
        return new ConcentratedLiquidityPool(
          pool,
          new FetchTickDataProvider(ChainList[0].apis.rest[0].address, pool.id)
        );
      }

      if (pool["@type"] === WEIGHTED_POOL_TYPE) {
        return new WeightedPool(pool as WeightedPoolRaw);
      }

      if (pool["@type"] === STABLE_POOL_TYPE) {
        return new StablePool(pool as StablePoolRaw);
      }

      if (pool["@type"] === COSMWASM_POOL_TYPE) {
        return new TransmuterPool(pool as CosmwasmPoolRaw);
      }
    })
    .filter(
      (
        pool
      ): pool is
        | ConcentratedLiquidityPool
        | WeightedPool
        | StablePool
        | TransmuterPool => pool !== undefined
    );

  // prep router params
  const preferredPoolIds = routablePools.reduce((preferredPoolIds, pool) => {
    if (pool.type === "concentrated") {
      preferredPoolIds.push(pool.id);
    }
    if (pool.type === "transmuter") {
      preferredPoolIds.unshift(pool.id);
    }

    return preferredPoolIds;
  }, [] as string[]);
  const getPoolTotalValueLocked = (poolId: string) => {
    const pool = poolsResponse.pools.find((pool) =>
      "pool_id" in pool ? pool.pool_id : pool.id === poolId
    );
    if (!pool) {
      console.warn("No pool found for pool", poolId);
      return new Dec(0);
    }
    if (!pool.liquidityUsd) {
      console.warn("No TVL found for pool", poolId);
      return new Dec(0);
    } else return new Dec(pool.liquidityUsd.toString());
  };

  return new OptimizedRoutes({
    pools: routablePools,
    preferredPoolIds,
    getPoolTotalValueLocked,
  });
}
