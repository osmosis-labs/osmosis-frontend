import { IAmountConfig } from '@keplr-wallet/hooks';
import { AppCurrency } from '@keplr-wallet/types';

export interface TokenSwapConfig extends IAmountConfig {
	outCurrency: AppCurrency;
	setInCurrency: (minimalDenom: string) => void;
}
