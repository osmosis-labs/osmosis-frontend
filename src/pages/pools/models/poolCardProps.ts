import { AppCurrency } from '@keplr-wallet/types';

interface PoolCardBaseProp {
	poolId: string;
	liquidity: {
		value: string;
		isLoading: boolean;
	};
	tokens: AppCurrency[];
}

export interface IncentivizedPoolCardProp extends PoolCardBaseProp {
	apr: {
		value: string | undefined;
		isLoading: boolean;
	};
}

export interface MyPoolCardProp extends PoolCardBaseProp {
	apr: {
		value: string | undefined;
		isLoading: boolean;
	};
	myLiquidity: {
		value: string;
		isLoading: boolean;
	};
	myLockedAmount: {
		value: string | undefined;
		isLoading: boolean;
	};
}
