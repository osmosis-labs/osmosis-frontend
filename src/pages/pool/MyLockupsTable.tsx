import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { CoinPretty } from '@keplr-wallet/unit';

const tableWidths = ['25%', '25%', '25%', '25%'];
export const MyLockupsTable: FunctionComponent<{
	poolId: string;
}> = observer(({ poolId }) => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

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
	lockup: {
		amount: CoinPretty;
		lockIds: string[];
	};
}> = observer(({ duration, apy, lockup }) => {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

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
					onClick={e => {
						e.preventDefault();

						if (account.isReadyToSendMsgs) {
							// 현재 lockup 모듈의 구조상의 한계로 그냥 락업된 전체 토큰을 다 언락시키도록 한다.
							// TODO: 락이 여러번에 거쳐서 많은 수가 있다면 가스 리밋의 한계로 tx를 보내는게 불가능 할 수 있다.
							//       그러므로 최대 메세지 숫자를 제한해야한다.
							account.osmosis.sendBeginUnlockingMsg(lockup.lockIds);
						}
					}}>
					<p className="text-enabledGold">Unlock</p>
				</button>
			</td>
		</tr>
	);
});
