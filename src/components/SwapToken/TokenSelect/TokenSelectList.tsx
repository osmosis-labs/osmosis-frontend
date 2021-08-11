import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes, useCallback, useMemo, useState } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { SubTitleText, Text } from 'src/components/Texts';
import { colorPrimary, colorPrimaryDark, colorPrimaryLight, colorWhiteHigh } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	currencies: AppCurrency[];
	onSelect: (appCurrency: AppCurrency) => void;
}

export const TokenSelectList = observer(function TokenSelectList({ currencies, onSelect, onClick, ...props }: Props) {
	const [searchedToken, setSearchedToken] = useState<string>('');
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const filteredCurrencies = useMemo(() => {
		return currencies.filter(cur => {
			return cur.coinDenom.toUpperCase().includes(searchedToken.toUpperCase());
		});
	}, [currencies, searchedToken]);

	return (
		<TokenSelectListContainer
			onClick={e => {
				e.stopPropagation();
				onClick?.(e);
			}}
			{...props}>
			<TokenSearchSection>
				<Img style={{ width: `1.125rem`, height: `1.125rem` }} src="/public/assets/Icons/Search.svg" />
				<SearchTokenInput
					value={searchedToken}
					onChange={e => setSearchedToken(e.currentTarget.value)}
					placeholder="Search your token"
				/>
			</TokenSearchSection>
			<TokenItemList>
				{filteredCurrencies.map(cur => {
					const balance = queries.queryBalances
						.getQueryBech32Address(account.bech32Address)
						.balances.find(bal => bal.currency.coinMinimalDenom === cur.coinMinimalDenom);

					const amount =
						balance?.balance
							?.hideDenom(true)
							.trim(true)
							.maxDecimals(6)
							.toString() || '0';

					return <TokenItem key={cur.coinMinimalDenom} currency={cur} amount={amount} onClick={onSelect} />;
				})}
			</TokenItemList>
		</TokenSelectListContainer>
	);
});

const TokenSelectListContainer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	transform: translateY(100%);
	width: 100%;
	min-width: 500px;
	padding: 32px 20px 32px 16px;
	background-color: ${colorPrimaryDark};
	z-index: 3;
	border-bottom-right-radius: 1rem;
	border-bottom-left-radius: 1rem;
`;

const TokenSearchSection = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 2.25rem;
	border-radius: 1rem;
	background-color: ${colorPrimary};
	padding-left: 18px;
`;

const SearchTokenInput = styled.input`
	padding-left: 16px;
	padding-right: 16px;
	width: 100%;
	color: ${colorWhiteHigh};
`;

const TokenItemList = styled.ul`
	max-height: 215px;
	margin-top: 20px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		border: 1px solid ${colorPrimary};
		border-radius: 4px;
	}

	&::-webkit-scrollbar-track-piece {
		background: ${colorPrimary};
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${colorPrimaryLight};
		border-radius: 6px;
	}
`;

interface TokenItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'onClick'> {
	currency: AppCurrency;
	amount: string;
	onClick: (appCurrency: AppCurrency) => void;
}

function TokenItem({ currency, amount, onClick, ...props }: TokenItemProps) {
	const handleItemClicked = useCallback(() => {
		onClick(currency);
	}, [currency, onClick]);

	return (
		<TokenItemContainer onClick={handleItemClicked} {...props}>
			<CenterV>
				<Img loadingSpin style={{ width: '36px', height: '36px' }} src={currency.coinImageUrl} />
				<div style={{ marginLeft: 12 }}>
					<SubTitleText>{currency.coinDenom.toUpperCase()}</SubTitleText>
					{'paths' in currency && currency.paths.length > 0 ? <Text>{currency.paths[0].channelId}</Text> : null}
				</div>
			</CenterV>
			<Text emphasis="high">{amount}</Text>
		</TokenItemContainer>
	);
}

const TokenItemContainer = styled.li`
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 1rem;
	padding: 18px 12px;

	&:hover {
		background-color: ${colorPrimary};
	}

	cursor: pointer;
`;
