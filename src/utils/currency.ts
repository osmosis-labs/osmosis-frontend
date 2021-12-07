import { Currency } from '@keplr-wallet/types';
import { Dec, DecUtils, CoinPretty } from '@keplr-wallet/unit';

export function toCoinPretty(amount: string | Dec, currency: Currency) {
	const amountDec = typeof amount == 'string' ? new Dec(amount) : amount;
	return new CoinPretty(currency, amountDec.mul(DecUtils.getPrecisionDec(currency.coinDecimals)));
}

export function coinDisplay(coin: CoinPretty) {
	return coin
		.maxDecimals(6)
		.trim(true)
		.toString();
}
