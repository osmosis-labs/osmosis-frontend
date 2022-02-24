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
