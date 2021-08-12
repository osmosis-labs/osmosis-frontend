import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Int } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useMemo } from 'react';
import { ButtonToggle } from 'src/components/layouts/Buttons';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenInSwapConfig } from 'src/components/SwapToken/models';
import { Text } from 'src/components/Texts';
import { colorPrimaryDark } from 'src/emotionStyles/colors';
import { TokenAmountInput } from 'src/pages/main/components/TokenAmountInput';
import { useStore } from 'src/stores';
import { TokenSelect } from './TokenSelect';

interface Props {
	config: TokenInSwapConfig;
}

export const FromBox = observer(function FromBox({ config }: Props) {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.find(bal => bal.currency.coinMinimalDenom === config.sendCurrency.coinMinimalDenom);

	const availableBalance = useMemo(() => {
		if (!balance) {
			return new CoinPretty(config.sendCurrency, new Int('0'));
		}
		return balance.balance;
	}, [balance, config.sendCurrency]);

	const handleMaxButtonToggled = useCallback(() => {
		config.toggleIsMax();
	}, [config]);

	return (
		<TokenBoxContainer>
			<TokenBoxRow>
				<Text emphasis="medium">From</Text>
				<CenterV>
					<CenterV>
						<Text emphasis="medium" size="sm" style={{ marginRight: 8 }}>
							Available
						</Text>
						<Text color="primary">
							{availableBalance
								.trim(true)
								.maxDecimals(6)
								.toString()}
						</Text>
					</CenterV>
					<MaxButton type="button" size="small" isActive={config.isMax} onClick={handleMaxButtonToggled}>
						<Text size="xs" emphasis="medium">
							MAX
						</Text>
					</MaxButton>
				</CenterV>
			</TokenBoxRow>

			<TokenBoxRow>
				<TokenSelect
					options={config.sendableCurrencies.filter(
						cur => cur.coinMinimalDenom !== config.outCurrency.coinMinimalDenom
					)}
					value={config.sendCurrency}
					onSelect={(appCurrency: AppCurrency) => config.setInCurrency(appCurrency.coinMinimalDenom)}
					dropdownStyle={{ marginLeft: -16, width: 500 + 16 + 20 }}
				/>
				<TokenAmountInput
					amount={config.amount}
					currency={config.sendCurrency}
					onChange={text => config.setAmount(text)}
				/>
			</TokenBoxRow>
		</TokenBoxContainer>
	);
});

const TokenBoxContainer = styled.div`
	position: relative;
	border-radius: 1rem;
	padding: 16px 20px 16px 16px;
	background-color: ${colorPrimaryDark};
`;

const TokenBoxRow = styled.section`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
`;

const MaxButton = styled(ButtonToggle)`
	margin-left: 8px;
`;
