import React, { FunctionComponent } from 'react';
import { Img } from './Img';
import { Currency } from '@keplr-wallet/types';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

export const TokenListDisplay: FunctionComponent<{
	currencies: Currency[];
	onSelect: (minimalDenom: string) => void;
	close: () => void;
}> = observer(({ currencies, onSelect, close }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	return (
		<div className="pr-5 pl-4 pt-8 pb-8">
			<div className="w-full h-9 rounded-2xl bg-card pl-4.5 flex items-center">
				<Img className="w-4.5 h-4.5" src="/public/assets/Icons/Search.svg" />
				<input
					onClick={() => alert('To be implemented')}
					className="pl-4 w-full pr-4"
					placeholder="Search your token"
				/>
			</div>
			<ul className="mt-5">
				{currencies.map(cur => {
					const balance = queries.queryBalances
						.getQueryBech32Address(account.bech32Address)
						.balances.find(bal => bal.currency.coinMinimalDenom === cur.coinMinimalDenom);
					const amount = balance?.balance?.hideDenom(true).toString() || '0';

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
			</ul>
		</div>
	);
});

const TokenItem: FunctionComponent<{
	currency: Currency;
	amount: string;
	onSelect: () => void;
}> = ({ currency, amount, onSelect }) => {
	return (
		<li onClick={() => onSelect()} className="py-4.5 px-3 rounded-2xl hover:bg-card cursor-pointer">
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					{/* 현재로서는 Currency의 이미지를 가져올 방법이 없다. TODO: Currency에 imageUrl 추가 */}
					<Img loadingSpin style={{ width: '36px', height: '36px' }} src={''} />
					<div className="ml-3">
						<h6 className="leading-tight">{currency.coinDenom.toUpperCase()}</h6>
						{/* TODO: 일단 IBC 토큰은 나중에 다룬다... */}
						<p className="text-iconDefault text-md leading-tight">Channel-1</p>
					</div>
				</div>
				<p>{amount}</p>
			</div>
		</li>
	);
};
