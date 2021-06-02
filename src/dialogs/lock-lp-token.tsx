import React, { FunctionComponent, useState } from 'react';
import { BaseDialog, BaseDialogProps } from './base';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores';
import { Dec } from '@keplr-wallet/unit';

export const LockLpTokenDialog: FunctionComponent<BaseDialogProps & {
	poolId: string;
}> = observer(({ style, isOpen, close, poolId }) => {
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;
	const myPoolShare = queries.osmosis.queryGammPoolShare.getAvailableGammShare(account.bech32Address, poolId);

	const [amount, _setAmount] = useState('');
	const setAmount = (value: string) => {
		if (value === '') {
			value = '0';
		}

		if (value.startsWith('.')) {
			value = '0' + value;
		}

		try {
			const dec = new Dec(value);
			if (dec.lt(new Dec(0))) {
				return;
			}
		} catch {
			return;
		}

		_setAmount(value);
	};

	const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);

	return (
		<BaseDialog style={style} isOpen={isOpen} close={close}>
			<div className="text-white-high w-full h-full">
				<h5 className="mb-9">Lock LP tokens</h5>
				<div className="mb-7.5">
					<p>Lockup period</p>
				</div>
				<ul className="grid grid-cols-3 gap-9 mb-6">
					{lockableDurations.map((duration, i) => {
						return (
							<LockupItem
								key={i.toString()}
								duration={duration.humanize()}
								setSelected={() => {
									setSelectedDurationIndex(i);
								}}
								selected={i === selectedDurationIndex}
								apy={`${queries.osmosis.queryIncentivizedPools
									.computeAPY(poolId, duration, priceStore, priceStore.getFiatCurrency('usd')!)
									.toString()}%`}
							/>
						);
					})}
				</ul>
				<div className="w-full pt-3 pb-3.5 pl-3 pr-2.5 border border-white-faint rounded-2xl mb-15">
					<p className="mb-3">Amount to lock</p>
					<p className="text-sm mb-3.5">
						Available LP token: <span className="text-primary-50">{myPoolShare.trim(true).toString()}</span>
					</p>
					<div className="w-full rounded-lg bg-background px-2.5 grid" style={{ gridTemplateColumns: '1fr 40px' }}>
						<input
							type="number"
							className="text-white-high text-xl text-left font-title"
							onChange={e => {
								e.preventDefault();

								setAmount(e.currentTarget.value);
							}}
							value={amount}
						/>
						<button className="flex items-center justify-center bg-primary-200 rounded-md w-full my-1.5">
							<p className="text-xs leading-none font-normal">MAX</p>
						</button>
					</div>
				</div>
				<div className="w-full flex items-center justify-center">
					<button
						className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer"
						onClick={e => {
							e.preventDefault();

							if (account.isReadyToSendMsgs) {
								const duration = lockableDurations[selectedDurationIndex];
								account.osmosis.sendLockTokensMsg(duration.asSeconds(), [
									{
										currency: myPoolShare.currency,
										amount,
									},
								]);
							}
						}}>
						<p className="text-white-high font-semibold text-lg">Lock</p>
					</button>
				</div>
			</div>
		</BaseDialog>
	);
});

const LockupItem: FunctionComponent<{
	duration: string;
	selected: boolean;
	setSelected: () => void;
	apy: string;
}> = ({ duration, selected, setSelected, apy }) => {
	return (
		<li
			onClick={setSelected}
			className={cn(
				{
					'shadow-elevation-08dp': selected,
				},
				'rounded-2xl border py-5 px-4.5 border-opacity-30',
				selected ? 'border-enabledGold' : 'border-white-faint cursor-pointer hover:opacity-75'
			)}>
			<div className="flex items-center">
				<figure
					className={cn(
						'rounded-full w-4 h-4 mr-4',
						selected ? 'border-secondary-200 border-4 bg-white-high' : 'border-iconDefault border'
					)}
				/>
				<div className="flex flex-col">
					<h5>{duration}</h5>
					<p className="text-secondary-200">{apy}</p>
				</div>
			</div>
		</li>
	);
};
