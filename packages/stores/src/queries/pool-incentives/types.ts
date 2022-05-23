export type IncentivizedPools = {
  incentivized_pools: {
    pool_id: string;
    lockable_duration: string;
    gauge_id: string;
  }[];
};

export type LockableDurations = {
  lockable_durations: string[];
};

export type DistrInfo = {
  distr_info: {
    total_weight: string;
    records: {
      gauge_id: string;
      weight: string;
    }[];
  };
};
