import styled from '@emotion/styled';
import { AppCurrency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { colorPrimary, colorPrimaryLight } from '../../emotionStyles/colors';
import { useStore } from '../../stores';
import { Img } from './Img';

export const TokenListDisplay: FunctionComponent<{
	currencies: AppCurrency[];
	onSelect: (minimalDenom: string) => void;
	close: () => void;
}> = observer(({ currencies, onSelect, close }) => {
	const [input, setInput] = useState<string>('');
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const filteredCurrencies = useMemo(() => {
		return currencies.filter(cur => {
			return cur.coinDenom.toUpperCase().includes(input.toUpperCase());
		});
	}, [currencies, input]);

	return (
		<div className="pr-5 pl-4 pt-8 pb-8" onClick={e => e.stopPropagation()}>
			<div className="w-full h-9 rounded-2xl bg-card pl-4.5 flex items-center">
				<Img className="w-4.5 h-4.5" src="/public/assets/Icons/Search.svg" />
				<input
					value={input}
					onChange={e => setInput(e.currentTarget.value)}
					className="pl-4 w-full pr-4"
					placeholder="Search your token"
				/>
			</div>
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

					return (
						<TokenItem
							key={cur.coinMinimalDenom}
							currency={cur}
							amount={amount}
							onSelect={() => {
								onSelect(cur.coinMinimalDenom);
								close();
							}}
						/>
					);
				})}
			</TokenItemList>
		</div>
	);
});

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

const TokenItem: FunctionComponent<{
	currency: AppCurrency;
	amount: string;
	onSelect: () => void;
}> = ({ currency, amount, onSelect }) => {
	return (
		<li onClick={() => onSelect()} className="py-4.5 px-3 rounded-2xl hover:bg-card cursor-pointer">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<Img loadingSpin style={{ width: '36px', height: '36px' }} src={currency.coinImageUrl} />
					<div className="ml-3">
						<h6 className="leading-tight">{currency.coinDenom.toUpperCase()}</h6>
						{'paths' in currency && currency.paths.length > 0 ? (
							<p className="text-iconDefault text-md leading-tight">{currency.paths[0].channelId}</p>
						) : null}
					</div>
				</div>
				<p>{amount}</p>
			</div>
		</li>
	);
};
