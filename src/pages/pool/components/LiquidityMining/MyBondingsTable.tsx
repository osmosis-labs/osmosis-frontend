import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useState } from 'react';
import { TToastType, useToast } from 'src/components/common/toasts';
import { useStore } from 'src/stores';

const tableWidths = ['25%', '25%', '25%', '25%'];

interface Props {
	poolId: string;
}

export const MyBondingsTable = observer(function MyBondingsTable({ poolId }: Props) {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);

	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	return (
		<React.Fragment>
			<h6 className="mb-1">My Bondings</h6>
			<table className="w-full">
				<LockupTableHeader />
				<tbody className="w-full">
					{lockableDurations.map(lockableDuration => {
						const lockedCoin = queries.osmosis.queryAccountLocked
							.get(account.bech32Address)
							.getLockedCoinWithDuration(poolShareCurrency, lockableDuration);
						return (
							<LockupTableRow
								key={lockableDuration.humanize()}
								duration={lockableDuration.humanize()}
								lockup={lockedCoin}
								apy={`${queries.osmosis.queryIncentivizedPools
									.computeAPY(poolId, lockableDuration, priceStore, priceStore.getFiatCurrency('usd')!)
									.toString()}%`}
							/>
						);
					})}
				</tbody>
			</table>
		</React.Fragment>
	);
});

const LockupTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl mt-5 w-full text-white-mid">
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Bonding Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Current APR</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Amount</p>
				</td>
				<td className="flex items-center px-2 py-3 justify-end" style={{ width: tableWidths[i++] }}>
					<p>Action</p>
				</td>
			</tr>
		</thead>
	);
};

const LockupTableRow: FunctionComponent<{
	duration: string;
	apy: string;
	lockup: {
		amount: CoinPretty;
		lockIds: string[];
	};
}> = observer(({ duration, apy, lockup }) => {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const [isUnlocking, setIsUnlocking] = useState(false);

	const toast = useToast();

	let i = 0;
	return (
		<tr style={{ height: `76px` }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{duration}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{apy}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>
					{lockup.amount
						.maxDecimals(6)
						.trim(true)
						.toString()}
				</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<button
					className="disabled:opacity-50"
					disabled={!account.isReadyToSendMsgs || lockup.amount.toDec().equals(new Dec(0))}
					onClick={async e => {
						e.preventDefault();

						if (account.isReadyToSendMsgs) {
							try {
								setIsUnlocking(true);

								// XXX: Due to the block gas limit, restrict the number of lock id to included in the one tx.
								await account.osmosis.sendBeginUnlockingMsg(lockup.lockIds.slice(0, 3), '', tx => {
									setIsUnlocking(false);

									if (tx.code) {
										toast.displayToast(TToastType.TX_FAILED, { message: tx.log });
									} else {
										toast.displayToast(TToastType.TX_SUCCESSFULL, {
											customLink: chainStore.current.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
										});
									}
								});

								toast.displayToast(TToastType.TX_BROADCASTING);
							} catch (e) {
								setIsUnlocking(false);
								toast.displayToast(TToastType.TX_FAILED, { message: e.message });
							}
						}
					}}>
					{isUnlocking ? (
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
						<p className="text-enabledGold">Unbond All</p>
					)}
				</button>
			</td>
		</tr>
	);
});
