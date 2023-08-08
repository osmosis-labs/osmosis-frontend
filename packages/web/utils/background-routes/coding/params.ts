import { Dec } from "@keplr-wallet/unit";
import { OptimizedRoutesParams, RoutablePool } from "@osmosis-labs/pools";

import { decodePool, EncodedPool, encodePool } from "./pool";

export type EncodedOptimizedRoutesParams = Omit<
  OptimizedRoutesParams,
  "pools" | "getPoolTotalValueLocked"
> & {
  pools: EncodedPool[];
  /** Map of pool IDs to raw TVL in fiat. */
  poolTvlMap: Map<string, string>;
};

export function encodeOptimizedRoutesParams(
  params: OptimizedRoutesParams
): EncodedOptimizedRoutesParams {
  // map is a supported structured clone type
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
  const poolTvlMap = new Map<string, string>();

  params.pools.forEach((pool) => {
    poolTvlMap.set(pool.id, params.getPoolTotalValueLocked(pool.id).toString());
  });

  const pools = params.pools
    .map(encodePool)
    .filter((pool): pool is EncodedPool => Boolean(pool));

  return {
    pools,
    poolTvlMap,
    preferredPoolIds: params.preferredPoolIds,
    incentivizedPoolIds: Array.from(params.incentivizedPoolIds),
    stakeCurrencyMinDenom: params.stakeCurrencyMinDenom,
    maxHops: params.maxHops,
    maxRoutes: params.maxRoutes,
    maxSplit: params.maxSplit,
    maxSplitIterations: params.maxSplitIterations,
  };
}

export function decodeOptimizedRoutesParams(
  params: EncodedOptimizedRoutesParams
): OptimizedRoutesParams {
  const poolTvlMap = new Map<string, Dec>();

  params.poolTvlMap.forEach((value, key) => {
    poolTvlMap.set(key, new Dec(value));
  });

  return {
    ...params,
    pools: params.pools
      .map(decodePool)
      .filter((pool): pool is RoutablePool => Boolean(pool)),
    getPoolTotalValueLocked: (poolId: string) =>
      poolTvlMap.get(poolId) ?? new Dec(0),
  };
}
