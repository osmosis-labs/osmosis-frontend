export type SuperfluidParams = {
	params: {
		// Dec
		minimum_risk_factor: string;
	};
};

export type SuperfluidAssetMultiplier = {
	osmo_equivalent_multiplier: {
		// Int
		epoch_number: string;
		denom: string;
		// Dec
		multiplier: string;
	};
};

export type SuperfluidAllAssets = {
	assets: [
		{
			denom: string;
			asset_type: string;
		}
	];
};

export type SuperfluidDelegationRecords = {
	delegator_address: string;
	validator_address: string;
	delegation_amount: {
		denom: string;
		amount: string;
	};
};

export type SuperfluidDelegations = {
	superfluid_delegation_records: SuperfluidDelegationRecords[];
	total_delegated_coins: [
		{
			denom: string;
			amount: string;
		}
	];
};
