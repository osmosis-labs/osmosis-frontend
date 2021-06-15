export interface GAMMPoolData {
	id: string;
	poolParams: {
		lock: boolean;
		// Dec. Ex) 10% -> 0.1
		swapFee: string;
		// Dec. Ex) 10% -> 0.1
		exitFee: string;
		smoothWeightChangeParams: {
			start_time: string;
			duration: string;
			initialPoolWeights: {
				token: {
					denom: string;
					amount: string;
				};
				weight: string;
			}[];
			targetPoolWeights: {
				token: {
					denom: string;
					amount: string;
				};
				weight: string;
			}[];
		} | null;
	};
	// Int
	totalWeight: string;
	totalShares: {
		denom: string;
		// Int
		amount: string;
	};
	poolAssets: [
		{
			weight: string;
			token: {
				denom: string;
				amount: string;
			};
		}
	];
}
