import { AmountConfig } from '@keplr-wallet/hooks';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { AppCurrency } from '@keplr-wallet/types';
import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { useState } from 'react';

export class BasicAmountConfig extends AmountConfig {
	@observable.ref
	protected _currency: AppCurrency;

	constructor(
		chainGetter: ChainGetter,
		initialChainId: string,
		sender: string,
		currency: AppCurrency,
		queryBalances: ObservableQueryBalances
	) {
		super(chainGetter, initialChainId, sender, undefined, queryBalances);

		this._currency = currency;

		makeObservable(this);
	}

	get currency(): AppCurrency {
		return this._currency;
	}

	@override
	setAmount(amount: string) {
		this.setIsMax(false);
		super.setAmount(amount);
	}

	@action
	setCurrency(currency: AppCurrency) {
		this._currency = currency;
	}

	@override
	get sendCurrency(): AppCurrency {
		return this.currency;
	}

	@computed
	get sendableCurrencies(): AppCurrency[] {
		return [this.sendCurrency];
	}
}

export const useBasicAmountConfig = (
	chainGetter: ChainGetter,
	chainId: string,
	sender: string,
	currency: AppCurrency,
	queryBalances: ObservableQueryBalances
) => {
	const [config] = useState(() => new BasicAmountConfig(chainGetter, chainId, sender, currency, queryBalances));
	config.setChain(chainId);
	config.setQueryBalances(queryBalances);
	config.setSender(sender);
	config.setCurrency(currency);

	return config;
};
