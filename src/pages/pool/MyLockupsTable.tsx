import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

const tableWidths = ['25%', '25%', '25%', '25%'];
export const MyLockupsTable: FunctionComponent<{
	poolId: string;
}> = observer(({ poolId }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);

	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	return (
		<React.Fragment>
			<h6 className="mb-1">My Lockups</h6>
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
								amount={lockedCoin
									.maxDecimals(6)
									.trim(true)
									.toString()}
								apy="0%"
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
					<p>Lock Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Current APY</p>
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
	amount: string;
}> = ({ duration, apy, amount }) => {
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
				<p>{amount}</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<button onClick={() => alert('Unlock flow')}>
					<p className="text-enabledGold">Unlock</p>
				</button>
			</td>
		</tr>
	);
};
