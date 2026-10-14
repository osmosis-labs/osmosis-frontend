import type { PoolResponse } from "@osmosis-labs/types";

import { createNodeQuery } from "../../create-node-query";

export {
  CONCENTRATED_LIQ_POOL_TYPE,
  ConcentratedPoolRawResponse,
  COSMWASM_POOL_TYPE,
  CosmwasmPoolRawResponse,
  PoolRawResponse,
  PoolResponse,
  STABLE_POOL_TYPE,
  StablePoolRawResponse,
  WEIGHTED_POOL_TYPE,
  WeightedPoolRawResponse,
} from "@osmosis-labs/types";

export const queryPoolChain = createNodeQuery<PoolResponse, { poolId: string }>(
  {
    path: (params) => `/osmosis/poolmanager/v1beta1/pools/${params.poolId}`,
  }
);
