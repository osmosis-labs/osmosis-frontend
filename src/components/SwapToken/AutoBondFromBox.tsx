import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { CoinPretty, Int } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { CSSProperties, HTMLAttributes, useCallback } from 'react';
import { ButtonToggle } from 'src/components/layouts/Buttons';
import { CenterV } from 'src/components/layouts/Containers';
import { TokenInSwapConfig } from 'src/components/SwapToken/models';
import { TokenBoxContainer, TokenBoxRow } from 'src/components/SwapToken/StyledTokenBox';
import { Text } from 'src/components/Texts';
import { useBooleanStateWithWindowEvent } from 'src/hooks/useBooleanStateWithWindowEvent';
import { TokenAmountInput } from 'src/pages/main/components/TokenAmountInput';
import { useStore } from 'src/stores';
import { TokenSelect } from './TokenSelect';
import useWindowSize from '../../hooks/useWindowSize';
import { PoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';

interface Props extends HTMLAttributes<HTMLDivElement> {
	config: PoolSwapConfig;
	dropdownStyle?: CSSProperties;
	dropdownClassName?: string;
	handleMax: () => any;
}

export const AutoBondFromBox = observer(function AutoBondFromBox({
	config,
	handleMax,
	dropdownStyle,
	dropdownClassName,
	...props
}: Props) {
	const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useBooleanStateWithWindowEvent(false);
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.balances.find(bal => bal.currency.coinMinimalDenom === config.sendCurrency.coinMinimalDenom);

	const availableBalance = (() => {
		if (!balance) {
			return new CoinPretty(config.sendCurrency, new Int('0'));
		}
		return balance.balance;
	})();

	const { isMobileView } = useWindowSize();

	const handleMaxButtonToggled = useCallback(() => {
		if (config.isMax) config.toggleIsMax();
		else handleMax();
	}, [config, handleMax]);

	return (
		<TokenBoxContainer {...props}>
			<TokenBoxRow>
				<Text emphasis="medium" isMobileView={isMobileView}>
					From
				</Text>
				<CenterV>
					<CenterV>
						<Text emphasis="medium" size="sm" style={{ marginRight: 8 }} isMobileView={isMobileView}>
							Available
						</Text>
						<Text color="primary" isMobileView={isMobileView}>
							{availableBalance
								.trim(true)
								.maxDecimals(6)
								.toString()}
						</Text>
					</CenterV>
					<MaxButton type="button" size="small" isActive={config.isMax} onClick={handleMaxButtonToggled}>
						<Text size="xs" emphasis="medium" style={{ lineHeight: 1.2 }} isMobileView={isMobileView}>
							MAX
						</Text>
					</MaxButton>
				</CenterV>
			</TokenBoxRow>

			<TokenBoxRow>
				<TokenSelect
					options={config.sendableCurrencies}
					value={config.sendCurrency}
					onSelect={(appCurrency: AppCurrency) => {
						const currentSend = config.sendCurrency;
						config.setInCurrency(appCurrency.coinMinimalDenom);
						config.setOutCurrency(currentSend.coinMinimalDenom);
					}}
					isDropdownOpen={isTokenDropdownOpen}
					onDropdownClose={() => setIsTokenDropdownOpen(false)}
					onDropdownOpen={() => setIsTokenDropdownOpen(true)}
					dropdownStyle={dropdownStyle}
					dropdownClassName={dropdownClassName}
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

const MaxButton = styled(ButtonToggle)`
	margin-left: 8px;
`;

const HalfButton = styled(MaxButton)``;
