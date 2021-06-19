import React, { FunctionComponent, useState } from 'react';
import moment from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { CoinPretty } from '@keplr-wallet/unit';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { TToastType, useToast } from '../../components/common/toasts';

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
		lockIds: string[];
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
			{unlockingDatas.length > 0 ? (
				<React.Fragment>
					<h6 className="mb-1">Unbondings</h6>
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
										lockIds={unlocking.lockIds}
										endTime={unlocking.endTime}
									/>
								);
							})}
						</tbody>
					</table>
				</React.Fragment>
			) : null}
		</React.Fragment>
	);
});

const UnlockingTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl mt-5 w-full text-white-mid">
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Bonding Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Amount</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Unbonding Complete</p>
				</td>
			</tr>
		</thead>
	);
};

const UnlockingTableRow: FunctionComponent<{
	duration: string;
	amount: string;
	lockIds: string[];
	endTime: Date;
}> = observer(({ duration, amount, lockIds, endTime }) => {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const toast = useToast();

	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const endTimeMoment = moment(endTime);

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
				{endTimeMoment.isBefore(dayjs()) ? (
					<button
						className="disabled:opacity-50"
						disabled={!account.isReadyToSendMsgs}
						onClick={async e => {
							e.preventDefault();

							if (account.isReadyToSendMsgs) {
								setIsWithdrawing(true);

								try {
									// TODO: 락이 여러번에 거쳐서 많은 수가 있다면 가스 리밋의 한계로 tx를 보내는게 불가능 할 수 있다.
									//       그러므로 최대 메세지 숫자를 제한해야한다.
									await account.osmosis.sendUnlockPeriodLockMsg(lockIds, '', tx => {
										setIsWithdrawing(false);

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
									setIsWithdrawing(false);
									toast.displayToast(TToastType.TX_FAILED, { message: e.message });
								}
							}
						}}>
						{isWithdrawing ? (
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
							<p className="text-enabledGold">Withdraw</p>
						)}
					</button>
				) : (
					<p>{endTimeMoment.fromNow()}</p>
				)}
			</td>
		</tr>
	);
});
