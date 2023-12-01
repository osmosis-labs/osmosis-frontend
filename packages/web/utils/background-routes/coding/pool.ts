import {
  AstroportPclPool,
  BasePool,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  CosmwasmPoolRaw,
  FetchTickDataProvider,
  RoutablePool,
  StablePool,
  StablePoolRaw,
  TransmuterPool,
  WeightedPool,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";
import { PoolRaw } from "@osmosis-labs/stores";

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
    pool instanceof TransmuterPool ||
    pool instanceof AstroportPclPool
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
    poolRaw = poolRaw as ConcentratedLiquidityPoolRaw;
    return new ConcentratedLiquidityPool(
      poolRaw,
      new FetchTickDataProvider(
        `${ChainList[0].apis.rest[0].address}/`,
        poolRaw.id
      )
    );
  } else if (type === "transmuter") {
    return new TransmuterPool(poolRaw as CosmwasmPoolRaw);
  } else if (type === "astroport-pcl") {
    return new AstroportPclPool(poolRaw as CosmwasmPoolRaw);
  }
}
