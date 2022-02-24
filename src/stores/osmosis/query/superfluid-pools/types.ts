import { CoinPretty } from '@keplr-wallet/unit';

export type SuperfluidAllAssets = {
	assets: [
		{
			denom: string;
			asset_type: string;
		}
	];
};

export type SuperfluidDelegationRecordsResponse = {
	delegator_address: string;
	validator_address: string;
	delegation_amount: {
		denom: string;
		amount: string;
	};
};

export type SuperfluidDelegationsResponse = {
	superfluid_delegation_records: SuperfluidDelegationRecordsResponse[];
	total_delegated_coins: [
		{
			denom: string;
			amount: string;
		}
	];
};

export type SuperfluidDelegation = {
	delegator_address: string;
	validator_address: string;
	amount: CoinPretty;
};
