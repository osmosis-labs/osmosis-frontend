export type TotalClaimable = {
	coins: {
		denom: string;
		amount: string;
	}[];
};

export type ClaimRecord = {
	claim_record: {
		address: string | '';
		initial_claimable_amount: {
			denom: string;
			amount: string;
		}[];
		// Add liquidity, swap, vote, stake
		action_completed: [boolean, boolean, boolean, boolean] | [];
	};
};
