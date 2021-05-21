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
