import React, { FunctionComponent } from 'react';
import { Img } from '../../components/common/Img';
import { staticAssetsDomain } from '../../constants/urls';
import { CreateNewPoolConfig } from './index';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { AppCurrency } from '@keplr-wallet/types';

export const NewPoolStage2: FunctionComponent<{
	config: CreateNewPoolConfig;
	close: () => void;
}> = observer(({ config, close }) => {
	return (
		<React.Fragment>
			<div className="pl-4.5">
				<div className="mb-4.5 flex justify-between items-center w-full">
					<h5>Create New Pool</h5>
					<button onClick={close} className="hover:opacity-75 cursor-pointer">
						<Img className="w-6 h-6" src={`${staticAssetsDomain}/public/assets/Icons/X.svg`} />
					</button>
				</div>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 2/3 - Input amount to Add </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
			<ul className="mt-5 flex flex-col gap-3">
				{config.assets.map((asset, i) => {
					return <Pool key={asset.amountConfig.currency.coinMinimalDenom} config={config} assetAt={i} />;
				})}
			</ul>
		</React.Fragment>
	);
});

const Pool: FunctionComponent<{
	config: CreateNewPoolConfig;
	assetAt: number;
}> = observer(({ config, assetAt }) => {
	const asset = config.assets[assetAt];

	const { chainStore, queriesStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const balance = queries.queryBalances
		.getQueryBech32Address(account.bech32Address)
		.getBalanceFromCurrency(asset.amountConfig.currency);

	return (
		<li className="pt-4.5 pb-4.5 pr-7 pl-4.5 border border-white-faint rounded-2xl relative">
			<div className="flex items-center justify-between">
				<TokenRatioDisplay currency={asset.amountConfig.currency} percentage={asset.percentage} />
				<div className="flex flex-col items-end">
					<div className="flex items-center mb-1">
						<p className="text-white-emphasis text-sm">
							Balance:{' '}
							{balance
								.trim(true)
								.maxDecimals(6)
								.toString()}
						</p>
						<button
							onClick={() => asset.amountConfig.toggleIsMax()}
							className="rounded-2xl border border-enabledGold ml-2.5">
							<p className="text-secondary-200 text-sm px-2.5">MAX</p>
						</button>
					</div>
					<div>
						<input
							type="number"
							className="w-full font-title bg-black py-1.5 h-9 rounded-lg mr-2.5 pr-1.5 border border-transparent focus:border-enabledGold text-white placeholder-white-disabled text-right text-lg leading-none"
							onChange={e => {
								asset.amountConfig.setAmount(e.currentTarget.value);
							}}
							value={asset.amountConfig.amount}
						/>
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
				<Img loadingSpin style={{ width: '44px', height: '44px' }} src={currency.coinImageUrl} />
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
