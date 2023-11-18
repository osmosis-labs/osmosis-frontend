import {
  BasePool,
  ConcentratedLiquidityPool,
  makeStaticPoolFromRaw,
  PoolRaw,
  RoutablePool,
  StablePool,
  TransmuterPool,
  WeightedPool,
} from "@osmosis-labs/pools";

export type EncodedPool = {
  type: BasePool["type"];
  poolRaw: PoolRaw;
};

export function encodePool(pool: RoutablePool): EncodedPool | undefined {
  // going to assume that all pools are concrete pool instances
  // as they are in our web frontend
  if (
    pool instanceof WeightedPool ||
    pool instanceof StablePool ||
    pool instanceof ConcentratedLiquidityPool ||
    pool instanceof TransmuterPool
  ) {
    return {
      type: pool.type,
      poolRaw: pool.raw,
    };
  }
}

export function decodePool({ poolRaw }: EncodedPool): RoutablePool | undefined {
  return makeStaticPoolFromRaw(poolRaw);
}
