export type IncentivizedPools = {
	incentivized_pools: {
		pool_id: string;
		lockable_duration: string;
		pot_id: string;
	}[];
};

export type LockableDurations = {
	lockable_durations: string[];
};

export type DistrInfo = {
	distr_info: {
		total_weight: string;
		records: {
			pot_id: string;
			weight: string;
		}[];
	};
};
