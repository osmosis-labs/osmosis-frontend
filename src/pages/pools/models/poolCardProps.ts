import { AppCurrency } from '@keplr-wallet/types';

interface PoolCardBaseProp {
	poolId: string;
	liquidity: string;
	tokens: AppCurrency[];
}

export interface IncentivizedPoolCardProp extends PoolCardBaseProp {
	apr: string;
}

export interface MyPoolCardProp extends PoolCardBaseProp {
	apr?: string;
	myLiquidity: string;
	myLockedAmount?: string;
}
