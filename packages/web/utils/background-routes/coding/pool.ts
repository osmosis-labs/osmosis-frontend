import {
  BasePool,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  FetchPoolAmountProvider,
  FetchTickDataProvider,
  RoutablePool,
  StablePool,
  StablePoolRaw,
  WeightedPool,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";
import { PoolRaw } from "@osmosis-labs/stores";

import { ChainInfos } from "~/config";

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
    pool instanceof ConcentratedLiquidityPool
  ) {
    return {
      type: pool.type,
      poolRaw: pool.raw,
    };
  }
}

export function decodePool({
  type,
  poolRaw,
}: EncodedPool): RoutablePool | undefined {
  if (type === "weighted") {
    return new WeightedPool(poolRaw as WeightedPoolRaw);
  } else if (type === "stable") {
    return new StablePool(poolRaw as StablePoolRaw);
  } else if (type === "concentrated") {
    return new ConcentratedLiquidityPool(
      poolRaw as ConcentratedLiquidityPoolRaw,
      new FetchTickDataProvider(ChainInfos[0].rest, poolRaw.id),
      new FetchPoolAmountProvider(ChainInfos[0].rest, poolRaw.id)
    );
  }
}
