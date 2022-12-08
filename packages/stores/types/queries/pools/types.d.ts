import { WeightedPoolRaw } from "@osmosis-labs/pools";
import { Duration } from "dayjs/plugin/duration";
import { CoinPretty } from "@keplr-wallet/unit";
export declare type Pools = {
    pools: WeightedPoolRaw[];
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
