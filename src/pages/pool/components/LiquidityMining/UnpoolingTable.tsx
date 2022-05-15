import moment from 'dayjs';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { TableBodyRow, TableData, TableHeadRow } from 'src/components/Tables';
import { SubTitleText, Text } from 'src/components/Texts';
import { useStore } from 'src/stores';
import useWindowSize from 'src/hooks/useWindowSize';

const tableWidths = ['40%', '40%', '20%'];

export const UnpoolingTable = observer(() => {
	const { chainStore, accountStore, queriesStore } = useStore();

	const { isMobileView } = useWindowSize();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const unlockingTokensExceptLPShares = queries.osmosis.queryLockableDurations.lockableDurations.map(duration => {
		return {
			duration,
			unlockings: queries.osmosis.queryAccountLocked
				.get(account.bech32Address)
				.getUnlockingCoinsWithDuration(duration)
				.filter(unlocking => !unlocking.amount.currency.coinMinimalDenom.startsWith('gamm/pool/')),
		};
	});

	return (
		<div className="mt-10">
			<div className="px-5 md:px-0">
				<SubTitleText isMobileView={isMobileView}>Depoolings</SubTitleText>
			</div>
			<div className="text-white-mid mt-2 w-full px-4 py-1.5 border-2 border-solid border-secondary-50 border-opacity-60 rounded-lg">
				Note: Depooling asset balance shown is a total across all pools, not on a per-pool basis
			</div>
			<table className="w-full">
				<UnpoolingTableHeader isMobileView={isMobileView} />
				<tbody className="w-full">
					{unlockingTokensExceptLPShares.map(({ duration, unlockings }, i) => {
						return (
							<React.Fragment key={i.toString()}>
								{unlockings.map((unlocking, i) => {
									return (
										<UnpoolingTableRow
											key={i.toString()}
											duration={duration.humanize()}
											amount={unlocking.amount
												.maxDecimals(6)
												.trim(true)
												.toString()}
											lockIds={unlocking.lockIds}
											endTime={unlocking.endTime}
											isMobileView={isMobileView}
										/>
									);
								})}
							</React.Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
});

interface UnlockingTableHeaderProps {
	isMobileView: boolean;
}

const UnpoolingTableHeader = observer(({ isMobileView }: UnlockingTableHeaderProps) => {
	return (
		<thead>
			<TableHeadRow>
				<TableData width={tableWidths[0]}>
					<Text isMobileView={isMobileView}>Duration</Text>
				</TableData>
				<TableData width={tableWidths[1]}>
					<Text isMobileView={isMobileView}>Amount</Text>
				</TableData>
				<TableData width={tableWidths[2]}>
					<Text isMobileView={isMobileView}>Unlock Complete</Text>
				</TableData>
			</TableHeadRow>
		</thead>
	);
});

interface UnlockingTableRowProps {
	duration: string;
	amount: string;
	lockIds: string[];
	endTime: Date;
	isMobileView: boolean;
}

const UnpoolingTableRow: FunctionComponent<UnlockingTableRowProps> = ({ duration, endTime, isMobileView, amount }) => {
	const endTimeMoment = moment(endTime);

	return (
		<TableBodyRow height={64}>
			<TableData width={tableWidths[0]}>
				<Text emphasis="medium" isMobileView={isMobileView}>
					{duration}
				</Text>
			</TableData>
			<TableData width={tableWidths[1]}>
				<Text emphasis="medium" isMobileView={isMobileView}>
					{amount}
				</Text>
			</TableData>
			<TableData width={tableWidths[2]}>
				<Text isMobileView={isMobileView}>{endTimeMoment.fromNow()}</Text>
			</TableData>
		</TableBodyRow>
	);
};
