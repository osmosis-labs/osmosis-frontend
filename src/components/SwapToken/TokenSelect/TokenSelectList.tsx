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
import { IntPretty } from '@keplr-wallet/unit';
import { MISC } from 'src/constants';
import cn from 'clsx';

const borderImages: Record<string, string> = {
	socialLive: '#89EAFB',
	greenBeach: '#00CEBA',
	kashmir: '#6976FE',
	frost: '#0069C4',
	cherry: '#FF652D',
	sunset: '#FFBC00',
	orangeCoral: '#FF8200',
	pinky: '#FF7A45',
};

interface ExtraAssetInfo {
	index: number;
	coinDenom: string;
	liquidityWeightPercentage: IntPretty;
}

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	currencies: AppCurrency[];
	shouldScrollIntoView: boolean;
	onSelect: (appCurrency: AppCurrency) => void;
	extraAssetInfos?: ExtraAssetInfo[];
	isSearchDisable?: boolean;
	isNoAmount?: boolean;
}

export const TokenSelectList = observer(function TokenSelectList({
	currencies,
	onSelect,
	onClick,
	shouldScrollIntoView,
	extraAssetInfos,
	isSearchDisable,
	isNoAmount,
	...props
}: Props) {
	const [searchedToken, setSearchedToken] = useState<string>('');
	const { chainStore, accountStore, queriesStore } = useStore();
	const inputRef = useRef<HTMLInputElement>(null);

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

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<TokenSelectListContainer
			ref={listRef}
			onClick={e => {
				e.stopPropagation();
				onClick?.(e);
			}}
			{...props}>
			{!isSearchDisable && (
				<TokenSearchSection>
					<img alt="search" style={{ width: `1.125rem`, height: `1.125rem` }} src="/public/assets/Icons/Search.svg" />
					<SearchTokenInput
						ref={inputRef}
						value={searchedToken}
						onChange={e => setSearchedToken(e.currentTarget.value)}
						placeholder="Search your token"
					/>
				</TokenSearchSection>
			)}
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

					const extraAssetInfo = extraAssetInfos
						? extraAssetInfos.find(extraAssetInfo => extraAssetInfo.coinDenom === cur.coinDenom)
						: undefined;

					return (
						<TokenItem
							key={cur.coinMinimalDenom}
							currency={cur}
							amount={amount}
							onClick={onSelect}
							extraAssetInfo={extraAssetInfo}
							isNoAmount={isNoAmount}
						/>
					);
				})}
			</TokenItemList>
		</TokenSelectListContainer>
	);
});

const TokenSelectListContainer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	width: calc(100vw - 60px);
	max-width: 468px;
	margin-left: -12px;
	transform: translateY(100%);
	padding: 12px 10px;
	background-color: ${colorPrimaryDark};
	z-index: 3;
	border-bottom-right-radius: 1rem;
	border-bottom-left-radius: 1rem;

	@media (min-width: 768px) {
		width: 100%;
		min-width: 455px;
		margin-left: -16px;
		padding: 28px 14px;
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
	margin-bottom: 14px;

	@media (min-width: 768px) {
		height: 2.25rem;
		padding-left: 18px;
		margin-bottom: 18px;
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
	extraAssetInfo?: ExtraAssetInfo;
	isNoAmount?: boolean;
}

function TokenItem({ currency, amount, onClick, extraAssetInfo, isNoAmount, ...props }: TokenItemProps) {
	const handleItemClicked = useCallback(() => {
		onClick(currency);
	}, [currency, onClick]);
	const { isMobileView } = useWindowSize();

	return (
		<TokenItemContainer onClick={handleItemClicked} {...props} className={extraAssetInfo ? '!pr-5 md:!pr-15' : ''}>
			<CenterV>
				{extraAssetInfo ? (
					<figure
						style={{ fontSize: isMobileView ? 48 : 60 }}
						className={cn(
							'c100 dark mr-2.5 md:mr-5 flex-shrink-0',
							`p${extraAssetInfo.liquidityWeightPercentage
								.maxDecimals(0)
								.locale(false)
								.toString()}`
						)}>
						<span>{extraAssetInfo.liquidityWeightPercentage.maxDecimals(0).toString()}%</span>
						<div className="slice">
							<div style={{ background: `${borderImages[MISC.GRADIENTS[extraAssetInfo.index]]}` }} className="bar" />
							<div className="fill" />
						</div>
					</figure>
				) : (
					<Img loadingSpin style={{ width: '36px', height: '36px' }} src={currency.coinImageUrl} />
				)}
				<div className={`${extraAssetInfo ? '' : 'ml-3'} flex-shrink-0`}>
					<h5 className={`text-base ${extraAssetInfo ? 'md:text-xl' : 'md:text-lg'} text-white-high`}>
						{currency.coinDenom.toUpperCase()}
					</h5>
					{'paths' in currency && currency.paths.length > 0 ? (
						<p className="text-white-mid text-xs md:text-base font-normal">{currency.paths[0].channelId}</p>
					) : null}
				</div>
			</CenterV>
			{!isNoAmount && <Text emphasis="high">{amount}</Text>}
		</TokenItemContainer>
	);
}

const TokenItemContainer = styled.li`
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 1rem;
	padding: 6px 12px 8px 4px;
	margin: 6px 0;

	&:hover {
		background-color: ${colorPrimary};
	}

	&:first-child {
		margin-top: 0;
	}

	&:last-child {
		margin-bottom: 0;
	}

	cursor: pointer;

	@media (min-width: 768px) {
		padding: 10px 12px;
		margin: 8px 0;
	}
`;
