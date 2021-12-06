import { IAmountConfig } from '@keplr-wallet/hooks';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty } from '@keplr-wallet/unit';

interface TokenSwapConfigBase extends IAmountConfig {
	outCurrency: AppCurrency;
}

export interface TokenInSwapConfig extends TokenSwapConfigBase {
	setInCurrency: (minimalDenom: string) => void;
	ratio: number | undefined;
	setRatio(ratio: number | undefined): void;
}

export interface TokenOutSwapConfig extends TokenSwapConfigBase {
	outAmount: CoinPretty;
	setOutCurrency: (minimalDenom: string) => void;
}
