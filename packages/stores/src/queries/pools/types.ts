import { WeightedPoolRaw, StablePoolRaw } from "@osmosis-labs/pools";
import { Duration } from "dayjs/plugin/duration";
import { CoinPretty } from "@keplr-wallet/unit";

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
