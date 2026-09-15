import { ObservableQuery } from "@osmosis-labs/keplr-stores";
import {
  ConcentratedPoolRawResponse,
  CosmwasmPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "@osmosis-labs/server";

import { ObservableQueryPool } from "./pool";

export interface PoolGetter<PoolType> {
  getPool(id: string): PoolType | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): PoolType[];
}

export interface ObservableQueryPoolGetter
  extends PoolGetter<ObservableQueryPool>,
    ObservableQuery {
  paginate(): Promise<void>;
  fetchRemainingPools(params?: {
    limit?: number;
    minLiquidity?: number;
  }): Promise<void>;
}

export type Pools = {
  pools: PoolRaw[];
  totalNumberOfPools: string;
  pageInfo?: {
    hasNextPage: boolean;
  };
};

export type PoolType =
  | "concentrated"
  | "weighted"
  | "stable"
  | "transmuter"
  | "alloyed"
  | "cosmwasm";

/** Chain/sidecar pool payload used by the MobX query. Extra fields are present
 *  on some sources (CL balances, CosmWasm token balances) but not the node type. */
export type PoolRaw =
  | WeightedPoolRawResponse
  | StablePoolRawResponse
  | (ConcentratedPoolRawResponse & {
      token0Amount?: string;
      token1Amount?: string;
    })
  | (CosmwasmPoolRawResponse & {
      tokens?: { denom: string; amount: string }[];
    });

export const ALLOYED_POOL_CODE_IDS_MAINNET = ["814", "867", "996"];
