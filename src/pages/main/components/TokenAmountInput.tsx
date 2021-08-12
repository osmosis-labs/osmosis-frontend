import { Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStore } from 'src/stores';

interface Props {
	amount: string;
	currency: Currency;
	onChange: (input: string) => void;
}

export const TokenAmountInput = observer(({ amount, currency, onChange }: Props) => {
	const { priceStore } = useStore();

	const coinPretty = (() => {
		if (amount) {
			try {
				const result = new CoinPretty(currency, new Dec(amount).mul(DecUtils.getPrecisionDec(currency.coinDecimals)));
				if (result.toDec().gte(new Dec(0))) {
					return result;
				}
			} catch {
				return new CoinPretty(currency, new Dec(0));
			}
		}

		return new CoinPretty(currency, new Dec(0));
	})();

	const price =
		priceStore.calculatePrice('usd', coinPretty) ?? new PricePretty(priceStore.getFiatCurrency('usd')!, new Int(0));

	return (
		<div style={{ maxWidth: '250px' }} className="flex flex-col items-end">
			<input
				type="number"
				style={{ maxWidth: '250px' }}
				onChange={e => onChange(e.currentTarget.value)}
				value={amount}
				placeholder="0"
				className="s-tradebox-input s-number-input-default"
			/>
			<p className="font-body font-semibold text-sm truncate w-full text-right">≈ {price.toString()}</p>
		</div>
	);
});
