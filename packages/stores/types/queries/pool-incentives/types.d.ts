export declare type IncentivizedPools = {
    incentivized_pools: {
        pool_id: string;
        lockable_duration: string;
        gauge_id: string;
    }[];
};
export declare type LockableDurations = {
    lockable_durations: string[];
};
export declare type DistrInfo = {
    distr_info: {
        total_weight: string;
        records: {
            gauge_id: string;
            weight: string;
        }[];
    };
};
export declare type GaugeIdsWithDuration = {
    gauge_ids_with_duration: {
        gauge_id: string;
        duration: string;
    }[];
};
