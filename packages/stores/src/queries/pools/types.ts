import { ObservableQuery } from "@keplr-wallet/stores";
import { WeightedPoolRaw, StablePoolRaw } from "@osmosis-labs/pools";
import { Duration } from "dayjs/plugin/duration";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "./pool";

export interface PoolGetter extends ObservableQuery {
  getPool(id: string): ObservableQueryPool | undefined;
  poolExists(id: string): boolean | undefined;
  getAllPools(): ObservableQueryPool[];
}

export type Pools = {
  pools: (WeightedPoolRaw | StablePoolRaw)[];
};

export type NumPools = {
  num_pools: string;
};

/** Non OSMO gauge. */
export type ExternalGauge = {
  id: string;
  duration: Duration;
  rewardAmount?: CoinPretty;
  remainingEpochs: number;
};

export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : any[];
