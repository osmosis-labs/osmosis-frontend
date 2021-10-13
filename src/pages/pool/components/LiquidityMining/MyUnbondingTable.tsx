import { CoinPretty } from '@keplr-wallet/unit';
import moment from 'dayjs';
import dayjs from 'dayjs';
import { Duration } from 'dayjs/plugin/duration';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { Spinner } from 'src/components/Spinners';
import { TableBodyRow, TableData, TableHeadRow } from 'src/components/Tables';
import { SubTitleText, Text } from 'src/components/Texts';
import { useStore } from 'src/stores';

const tableWidths = ['40%', '40%', '20%'];

interface Props {
	poolId: string;
}

export const MyUnBondingTable = observer(function MyUnBondingTable({ poolId }: Props) {
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

	if (unlockingDatas.length === 0) {
		return null;
	}

	return (
		<>
			<SubTitleText>Unbondings</SubTitleText>
			<table style={{ width: '100%' }}>
				<UnlockingTableHeader />
				<tbody style={{ width: '100%' }}>
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
		</>
	);
});

function UnlockingTableHeader() {
	return (
		<thead>
			<TableHeadRow>
				<TableData width={tableWidths[0]}>
					<Text>Unbonding Duration</Text>
				</TableData>
				<TableData width={tableWidths[1]}>
					<Text>Amount</Text>
				</TableData>
				<TableData width={tableWidths[2]}>
					<Text>Unbonding Complete</Text>
				</TableData>
			</TableHeadRow>
		</thead>
	);
}

interface UnlockingTableRowProps {
	duration: string;
	amount: string;
	lockIds: string[];
	endTime: Date;
}

const UnlockingTableRow = observer(function UnlockingTableRow({
	duration,
	amount,
	lockIds,
	endTime,
}: UnlockingTableRowProps) {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const [isWithdrawing, setIsWithdrawing] = useState(false);

	const endTimeMoment = moment(endTime);

	return (
		<TableBodyRow height={64}>
			<TableData width={tableWidths[0]}>
				<Text emphasis="medium">{duration}</Text>
			</TableData>
			<TableData width={tableWidths[1]}>
				<Text emphasis="medium">{amount}</Text>
			</TableData>
			<TableData width={tableWidths[2]}>
				{endTimeMoment.isBefore(dayjs()) ? (
					<ButtonFaint
						disabled={!account.isReadyToSendMsgs}
						onClick={async e => {
							e.preventDefault();

							if (account.isReadyToSendMsgs) {
								setIsWithdrawing(true);

								try {
									// XXX: Due to the block gas limit, restrict the number of lock id to included in the one tx.
									await account.osmosis.sendUnlockPeriodLockMsg(lockIds.slice(0, 3), '', () => {
										setIsWithdrawing(false);
									});
								} catch (e) {
									setIsWithdrawing(false);
								}
							}
						}}>
						{isWithdrawing ? <Spinner /> : <Text color="gold">Withdraw</Text>}
					</ButtonFaint>
				) : (
					<Text>{endTimeMoment.fromNow()}</Text>
				)}
			</TableData>
		</TableBodyRow>
	);
});
