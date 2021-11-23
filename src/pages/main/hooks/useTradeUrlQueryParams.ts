import { useEffect, useState } from 'react';
import { autorun } from 'mobx';
import { useQueryParams, StringParam } from 'use-query-params';
import { AppCurrency } from '@keplr-wallet/types';

interface Trade {
	readonly sendCurrency: AppCurrency;
	readonly outCurrency: AppCurrency;
	readonly sendableCurrencies: AppCurrency[];
	setInCurrency(minimalDenom: string): void;
	setOutCurrency(minimalDenom: string): void;
}

/**
 * Synchronize a trade and the browser window's URL query params:
 * ```
 * ?from=OSMO&to=ETH
 * { from: CoinDenom, to: CoinDenom }
 * ```
 * Does not affect history.
 * @param config Current trade to synchronize.
 */
export const useTradeUrlQueryParams = ({
	sendCurrency,
	outCurrency,
	sendableCurrencies,
	setInCurrency,
	setOutCurrency,
}: Trade) => {
	const [{ to, from }, setQuery] = useQueryParams({ from: StringParam, to: StringParam });
	const [isInitialRender, setIsInitRender] = useState(true);

	useEffect(() => {
		// URL -> State: Look for URL change, match with supported currency. If so, set.
		if (isInitialRender) {
			if (from) {
				updateToValidCurrency(from, sendCurrency, sendableCurrencies, setInCurrency);
			}
			if (to) {
				updateToValidCurrency(to, outCurrency, sendableCurrencies, setOutCurrency);
			}

			setIsInitRender(false);
		}

		// State -> URL: When in/out currencies change in window, update URL.
		autorun(() => {
			const isADisparateCurrency = from !== sendCurrency.coinDenom || to !== outCurrency.coinDenom;
			if (!isInitialRender && isADisparateCurrency) {
				setQuery({ to: outCurrency.coinDenom, from: sendCurrency.coinDenom });
			}
		});
	});
};

function updateToValidCurrency(
	denom: string,
	{ coinDenom: prevCoin }: AppCurrency,
	validCurrencies: AppCurrency[],
	update: (coinMinimalDenom: string) => void
): void {
	let currency;
	if ((currency = validCurrencies.find(currency => currency.coinDenom === denom))) {
		if (currency.coinDenom !== prevCoin) {
			update(currency.coinMinimalDenom);
		}
	}
}
