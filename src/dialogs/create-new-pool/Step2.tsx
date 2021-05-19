import React, { FunctionComponent } from 'react';
import { Img } from '../../components/common/Img';
import { LINKS } from '../../constants';
import { CreateNewPoolState } from './index';
import upperCase from 'lodash-es/upperCase';
import { isNumber } from '../../utils/scripts';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { AppCurrency } from '@keplr-wallet/types';

export const NewPoolStage2: FunctionComponent<{
	state: CreateNewPoolState;
}> = observer(({ state }) => {
	return (
		<>
			<div className="pl-4.5">
				<h5 className="mb-4.5">Create New Pool</h5>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 2/3 - Input amount to Add </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<ul className="mt-5 flex flex-col gap-3">
				{state.assets.map((asset, i) => {
					return <Pool key={asset.currency.coinMinimalDenom} state={state} assetAt={i} />;
				})}
			</ul>
		</>
	);
});

const Pool: FunctionComponent<{
	state: CreateNewPoolState;
	assetAt: number;
}> = observer(({ state, assetAt }) => {
	const asset = state.assets[assetAt];

	const { chainStore, queriesStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.getBalanceFromCurrency(asset.currency);

	return (
		<li className="pt-4.5 pb-4.5 pr-7 pl-4.5 border border-white-faint rounded-2xl relative">
			<div className="flex items-center justify-between">
				<TokenRatioDisplay currency={asset.currency} percentage={asset.percentage} />
				<div className="flex flex-col items-end">
					<div className="flex items-center mb-1">
						<p className="text-white-emphasis text-sm">
							Balance:{' '}
							{balance
								.trim(true)
								.maxDecimals(6)
								.toString()}
						</p>
						<button onClick={() => alert('not implemented')} className="rounded-2xl border border-enabledGold ml-2.5">
							<p className="text-secondary-200 text-sm px-2.5">MAX</p>
						</button>
					</div>
					<div className="grid" style={{ gridTemplateColumns: '181px 80px' }}>
						<input
							className="w-full font-title bg-black py-1.5 h-9 rounded-lg mr-2.5 pr-1.5 border border-transparent focus:border-enabledGold text-white placeholder-white-disabled text-right text-lg leading-none"
							onChange={e => {
								state.setAssetAmountAt(assetAt, e.currentTarget.value);
							}}
							value={asset.amount}
						/>
						<div className="flex items-center justify-end">
							<h6 className="text-right">{asset.currency.coinDenom.toUpperCase()}</h6>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
});

const TokenRatioDisplay: FunctionComponent<{
	currency: AppCurrency;
	percentage: string;
}> = observer(({ currency, percentage }) => {
	return (
		<div className="flex items-center">
			<figure
				style={{ width: '56px', height: '56px' }}
				className="flex justify-center items-center rounded-full border-secondary-200 border mr-3">
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={LINKS.GET_TOKEN_IMG(currency.coinDenom)} />
			</figure>
			<div className="flex flex-col">
				<div className="flex items-center">
					<h5 className="leading-none font-semibold">{currency.coinDenom.toUpperCase()}</h5>
				</div>
				<p className="text-sm text-iconDefault mt-1">{percentage}%</p>
			</div>
		</div>
	);
});
