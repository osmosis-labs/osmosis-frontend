import { WeightedPoolRaw, StablePoolRaw } from "@osmosis-labs/pools";
import { Duration } from "dayjs/plugin/duration";
import { CoinPretty } from "@keplr-wallet/unit";
export declare type Pools = {
    pools: (WeightedPoolRaw | StablePoolRaw)[];
};
export declare type NumPools = {
    num_pools: string;
};
/** Non OSMO gauge. */
export declare type ExternalGauge = {
    id: string;
    duration: Duration;
    rewardAmount?: CoinPretty;
    remainingEpochs: number;
};
