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
import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "../../../env";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { queryNumPools } from "../../osmosis";
import { queryPaginatedPools } from "./providers/indexer";

/**
 * This function routes a given token to a specified output token denomination.
 * It fetches the router, gets a quote for the route and retrieves candidate routes.
 *
 * @param token - The token to be routed.
 * @param tokenOutDenom - The output token denomination.
 * @returns Returns a promise that resolves with the quote and candidate routes. */
export async function routeTokenOutGivenIn({
  chainList,
  token,
  tokenOutDenom,
  forcePoolId,
}: {
  chainList: Chain[];
  token: Token;
  tokenOutDenom: string;
  forcePoolId?: string;
}) {
  // get quote
  const router = await getRouter(chainList, forcePoolId ? 0 : undefined);
  const quote = await router.routeByTokenIn(token, tokenOutDenom, forcePoolId);
  const candidateRoutes = router.getCandidateRoutes(token.denom, tokenOutDenom);

  return {
    quote: {
      ...quote,
      split: quote.split.map((split) => ({
        initialAmount: split.initialAmount,
        pools: split.pools.map((pool) => ({ id: pool.id })),
        tokenOutDenoms: split.tokenOutDenoms,
        tokenInDenom: split.tokenInDenom,
      })),
    },
    candidateRoutes,
  };
}

const routerCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Gets pools and returns a cached router instance. */
export async function getRouter(
  chainList: Chain[],
  minLiquidityUsd = IS_TESTNET ? 0 : 1000,
  routerCacheTtl = 30 * 1000
): Promise<OptimizedRoutes> {
  return cachified({
    key: "router" + minLiquidityUsd,
    cache: routerCache,
    ttl: routerCacheTtl,
    async getFreshValue() {
      // fetch pool data
      const numPoolsResponse = await queryNumPools({ chainList });
      const poolsResponse = await queryPaginatedPools({
        chainList,
        page: 1,
        limit: Number(numPoolsResponse.num_pools),
        minimumLiquidity: minLiquidityUsd,
      });

      // create routable pool impls from response
      const routablePools = poolsResponse.pools
        .map((pool) => {
          if (pool["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
            pool = pool as ConcentratedLiquidityPoolRaw;
            return new ConcentratedLiquidityPool(
              pool,
              new FetchTickDataProvider(
                chainList[0].apis.rest[0].address,
                pool.id
              )
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
      const preferredPoolIds = routablePools.reduce(
        (preferredPoolIds, pool) => {
          if (pool.type === "concentrated") {
            preferredPoolIds.push(pool.id);
          }
          if (pool.type === "transmuter") {
            preferredPoolIds.unshift(pool.id);
          }

          return preferredPoolIds;
        },
        [] as string[]
      );
      const getPoolTotalValueLocked = (poolId: string) => {
        const pool = poolsResponse.pools.find((pool) =>
          "pool_id" in pool ? pool.pool_id : pool.id === poolId
        );
        if (!pool) {
          console.warn("No pool found for pool", poolId);
          return new Dec(0);
        }
        if (!pool.liquidityUsd) {
          return new Dec(0);
        } else return new Dec(pool.liquidityUsd.toString());
      };

      return new OptimizedRoutes({
        pools: routablePools,
        preferredPoolIds,
        getPoolTotalValueLocked,
      });
    },
  });
}
