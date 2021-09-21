import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Int } from '@keplr-wallet/unit';

const regexSignatureVerificationFailed = /^signature verification failed; please verify account number \(\d*\), sequence \((\d*)\) and chain-id \(osmosis-1\): unauthorized/;
const regexFailedToExecuteMessageAt = /^failed to execute message; message index: (\d+): (.+)/;
const regexCoinsOrDenoms = /(\d*)([a-zA-Z][a-zA-Z0-9/]{2,127})(,*)/g;
const regexSplitAmountAndDenomOfCoin = /(\d+)([a-zA-Z][a-zA-Z0-9/]{2,127})/;

export function prettifyTxError(message: string, currencies: AppCurrency[]): string {
	const matchSignatureVerificationFailed = message.match(regexSignatureVerificationFailed);
	if (matchSignatureVerificationFailed) {
		if (matchSignatureVerificationFailed.length >= 2) {
			const sequence = matchSignatureVerificationFailed[1];
			if (!Number.isNaN(parseInt(sequence))) {
				return `You have too many concurrent txs going on! Try resending after your prior tx lands on chain. (We couldn't send the tx with sequence number ${sequence})`;
			}
		}
	}

	// It is not important to let the usual users to know that in which order the transaction failed.
	const matchFailedToExecuteMessageAt = message.match(regexFailedToExecuteMessageAt);
	if (matchFailedToExecuteMessageAt) {
		if (matchFailedToExecuteMessageAt.length >= 3) {
			const failedAt = matchFailedToExecuteMessageAt[1];
			const actualMessage = matchFailedToExecuteMessageAt[2];
			if (!Number.isNaN(parseInt(failedAt))) {
				message = `${actualMessage.trim()} (at msg ${failedAt})`;
			}
		}
	}

	const currencyMap: Record<string, AppCurrency> = {};
	for (const currency of currencies) {
		currencyMap[currency.coinMinimalDenom] = currency;
	}

	const split = message.split(' ');
	for (let i = 0; i < split.length; i++) {
		const frag = split[i];
		const matchCoinsOrDenoms = frag.match(regexCoinsOrDenoms);
		if (matchCoinsOrDenoms) {
			// Actually, many cases can pass the regexCoinsOrDenoms because that regex tests onlt that the string has only alphabet or number or "/", ",".
			const mayCoinOrDenom = frag.split(',');
			for (let i = 0; i < mayCoinOrDenom.length; i++) {
				const value = mayCoinOrDenom[i];

				const valueHasLastColon = value.length > 0 && value.indexOf(':') === value.length - 1;

				const splitAmountAndDenom = value.match(regexSplitAmountAndDenomOfCoin);
				if (splitAmountAndDenom && splitAmountAndDenom.length === 3) {
					const amount = splitAmountAndDenom[1];
					const denom = splitAmountAndDenom[2];
					const currency = currencyMap[denom];
					if (currency) {
						const coinPretty = new CoinPretty(currency, new Int(amount)).separator('').trim(true);
						mayCoinOrDenom[i] = coinPretty.toString() + (valueHasLastColon ? ':' : '');
					}
				} else if (currencyMap[value]) {
					mayCoinOrDenom[i] = currencyMap[value].coinDenom + (valueHasLastColon ? ':' : '');
				}
			}

			split[i] = mayCoinOrDenom.join(',');
		}
	}

	return split.join(' ');
}
