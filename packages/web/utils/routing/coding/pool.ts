import {
  BasePool,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  FetchTickDataProvider,
  makeStaticPoolFromRaw,
  PoolRaw,
  RoutablePool,
  StablePool,
  TransmuterPool,
  WeightedPool,
} from "@osmosis-labs/pools";

import { ChainList } from "~/config/generated/chain-list";

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
  return makeStaticPoolFromRaw(
    poolRaw,
    new FetchTickDataProvider(
      `${ChainList[0].apis.rest[0].address}/`,
      (poolRaw as ConcentratedLiquidityPoolRaw).id
    )
  );
}
