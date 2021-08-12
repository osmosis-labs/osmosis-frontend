import styled from '@emotion/styled';
import { Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Text } from 'src/components/Texts';
import { colorWhiteHigh } from 'src/emotionStyles/colors';
import { cssAlignRightInput, cssNumberTextInput } from 'src/emotionStyles/forms';
import { cssFontPoppins } from 'src/emotionStyles/texts';
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
		<TokenAmountInputContainer>
			<AmountInput type="number" onChange={e => onChange(e.currentTarget.value)} value={amount} placeholder="0" />
			<Text weight="semiBold" size="sm" emphasis={!amount ? 'low' : 'high'}>
				≈ {price.toString()}
			</Text>
		</TokenAmountInputContainer>
	);
});

const TokenAmountInputContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	max-width: 250px;
`;

const AmountInput = styled.input`
	${cssFontPoppins};
	${cssAlignRightInput};
	${cssNumberTextInput};
	max-width: 250px;
	font-size: 24px;
	color: ${colorWhiteHigh};
	font-weight: 600;
`;
