export interface GAMMPoolData {
	id: string;
	poolParams: {
		lock: boolean;
		// Dec. Ex) 10% -> 0.1
		swapFee: string;
		// Dec. Ex) 10% -> 0.1
		exitFee: string;
	};
	// Int
	totalWeight: string;
	totalShare: {
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
