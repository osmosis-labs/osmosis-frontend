import React, { FunctionComponent, useState } from 'react';
import { wrapBaseDialog } from './base';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores';
import { TToastType, useToast } from '../components/common/toasts';
import { useBasicAmountConfig } from '../hooks/tx/basic-amount-config';

export const LockLpTokenDialog = wrapBaseDialog(
	observer(({ poolId, close }: { poolId: string; close: () => void }) => {
		const { chainStore, queriesStore, accountStore, priceStore } = useStore();

		const account = accountStore.getAccount(chainStore.current.chainId);
		const queries = queriesStore.get(chainStore.current.chainId);
		const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

		const amountConfig = useBasicAmountConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.osmosis.queryGammPoolShare.getShareCurrency(poolId),
			queries.queryBalances
		);

		const toast = useToast();

		const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);

		return (
			<div className="text-white-high w-full h-full">
				<h5 className="mb-9">Bond LP tokens</h5>
				<div className="mb-7.5">
					<p>Bonding period</p>
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
					<p className="mb-3">Amount to bond</p>
					<p className="text-sm mb-3.5">
						Available LP token:{' '}
						<span className="text-primary-50">
							{queries.queryBalances
								.getQueryBech32Address(account.bech32Address)
								.getBalanceFromCurrency(amountConfig.sendCurrency)
								.trim(true)
								.toString()}
						</span>
					</p>
					<div className="w-full rounded-lg bg-background px-2.5 grid" style={{ gridTemplateColumns: '1fr 40px' }}>
						<input
							type="number"
							className="text-white-high text-xl text-left font-title"
							onChange={e => {
								e.preventDefault();

								amountConfig.setAmount(e.currentTarget.value);
							}}
							value={amountConfig.amount}
						/>
						<button
							className="flex items-center justify-center bg-primary-200 rounded-md w-full my-1.5"
							onClick={e => {
								e.preventDefault();

								amountConfig.toggleIsMax();
							}}>
							<p className="text-xs leading-none font-normal">MAX</p>
						</button>
					</div>
				</div>
				<div className="w-full flex items-center justify-center">
					<button
						className="w-2/3 h-15 bg-primary-200 rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer disabled:opacity-50"
						disabled={!account.isReadyToSendMsgs || amountConfig.getError() != null}
						onClick={async e => {
							e.preventDefault();

							if (account.isReadyToSendMsgs) {
								const duration = lockableDurations[selectedDurationIndex];
								try {
									await account.osmosis.sendLockTokensMsg(
										duration.asSeconds(),
										[
											{
												currency: amountConfig.sendCurrency,
												amount: amountConfig.amount,
											},
										],
										'',
										tx => {
											if (tx.code) {
												toast.displayToast(TToastType.TX_FAILED, { message: tx.log });
											} else {
												toast.displayToast(TToastType.TX_SUCCESSFULL, {
													customLink: chainStore.current.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
												});
											}

											close();
										}
									);
									toast.displayToast(TToastType.TX_BROADCASTING);
								} catch (e) {
									toast.displayToast(TToastType.TX_FAILED, { message: e.message });
								}
							}
						}}>
						{account.isSendingMsg === 'lockTokens' ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
								<path
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									className="opacity-75"
								/>
							</svg>
						) : (
							<p className="text-white-high font-semibold text-lg">Bond</p>
						)}
					</button>
				</div>
			</div>
		);
	})
);

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
