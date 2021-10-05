import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import React, { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Img } from 'src/components/common/Img';
import { CenterV } from 'src/components/layouts/Containers';
import { SubTitleText, Text } from 'src/components/Texts';
import { colorPrimary, colorPrimaryDark, colorPrimaryLight, colorWhiteHigh } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';
import useWindowSize from 'src/hooks/useWindowSize';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	currencies: AppCurrency[];
	shouldScrollIntoView: boolean;
	onSelect: (appCurrency: AppCurrency) => void;
}

export const TokenSelectList = observer(function TokenSelectList({
	currencies,
	onSelect,
	onClick,
	shouldScrollIntoView,
	...props
}: Props) {
	const [searchedToken, setSearchedToken] = useState<string>('');
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const filteredCurrencies = useMemo(() => {
		return currencies.filter(cur => {
			return cur.coinDenom.toUpperCase().includes(searchedToken.toUpperCase());
		});
	}, [currencies, searchedToken]);

	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.scrollIntoView(false);
	}, [shouldScrollIntoView]);

	return (
		<TokenSelectListContainer
			ref={listRef}
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
	width: calc(100vw - 52px);
	max-width: 468px;
	margin-left: -12px;
	transform: translateY(100%);
	padding: 24px 15px 24px 12px;
	background-color: ${colorPrimaryDark};
	z-index: 3;
	border-bottom-right-radius: 1rem;
	border-bottom-left-radius: 1rem;

	@media (min-width: 768px) {
		width: 100%;
		min-width: 455px;
		margin-left: -16px;
		padding: 32px 20px 32px 16px;
	}
`;

const TokenSearchSection = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 2rem;
	border-radius: 1rem;
	background-color: ${colorPrimary};
	padding-left: 12px;

	@media (min-width: 768px) {
		height: 2.25rem;
		padding-left: 18px;
	}
`;

const SearchTokenInput = styled.input`
	padding-left: 10px;
	padding-right: 10px;
	font-size: 14px;
	width: 100%;
	color: ${colorWhiteHigh};

	@media (min-width: 768px) {
		padding-left: 16px;
		padding-right: 16px;
		font-size: 16px;
	}
`;

const TokenItemList = styled.ul`
	max-height: 215px;
	margin-top: 14px;
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

	@media (min-width: 768px) {
		margin-top: 20px;
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
	const { isMobileView } = useWindowSize();

	return (
		<TokenItemContainer onClick={handleItemClicked} {...props}>
			<CenterV>
				<Img loadingSpin style={{ width: '36px', height: '36px' }} src={currency.coinImageUrl} />
				<div style={{ marginLeft: 12 }}>
					<SubTitleText isMobileView={isMobileView}>{currency.coinDenom.toUpperCase()}</SubTitleText>
					{'paths' in currency && currency.paths.length > 0 ? (
						<Text isMobileView={isMobileView}>{currency.paths[0].channelId}</Text>
					) : null}
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
	padding: 14px 12px 14px 4px;

	&:hover {
		background-color: ${colorPrimary};
	}

	cursor: pointer;

	@media (min-width: 768px) {
		padding: 18px 12px;
	}
`;
