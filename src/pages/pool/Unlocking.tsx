import React, { FunctionComponent } from 'react';
import moment from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { CoinPretty } from '@keplr-wallet/unit';
import { Duration } from 'dayjs/plugin/duration';

const tableWidths = ['40%', '40%', '20%'];
export const UnlockingTable: FunctionComponent<{
	poolId: string;
}> = observer(({ poolId }) => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	let unlockingDatas: {
		duration: Duration;
		amount: CoinPretty;
		endTime: Date;
	}[] = [];

	for (const lockableDuration of lockableDurations) {
		const unlockings = queries.osmosis.queryAccountLocked
			.get(account.bech32Address)
			.getUnlockingCoinWithDuration(poolShareCurrency, lockableDuration);

		unlockingDatas = unlockingDatas.concat(
			unlockings.map(unlocking => {
				return {
					...unlocking,
					...{
						duration: lockableDuration,
					},
				};
			})
		);
	}

	return (
		<React.Fragment>
			<h6 className="mb-1">Unlocking</h6>
			<table className="w-full">
				<UnlockingTableHeader />
				<tbody className="w-full">
					{unlockingDatas.map((unlocking, i) => {
						return (
							<UnlockingTableRow
								key={i.toString()}
								duration={unlocking.duration.humanize()}
								amount={unlocking.amount
									.maxDecimals(6)
									.trim(true)
									.toString()}
								endTime={unlocking.endTime}
							/>
						);
					})}
				</tbody>
			</table>
		</React.Fragment>
	);
});

const UnlockingTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl mt-5 w-full text-white-mid">
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Lock Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Amount</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Unlock Complete</p>
				</td>
			</tr>
		</thead>
	);
};

const UnlockingTableRow: FunctionComponent<{
	duration: string;
	amount: string;
	endTime: Date;
}> = ({ duration, amount, endTime }) => {
	let i = 0;
	return (
		<tr style={{ height: `64px` }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{duration}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{amount}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{moment(endTime).fromNow()}</p>
			</td>
		</tr>
	);
};
