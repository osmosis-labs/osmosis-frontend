import moment from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { TableBodyRow, TableData, TableHeadRow } from 'src/components/Tables';
import { SubTitleText, Text } from 'src/components/Texts';
import { useStore } from 'src/stores';
import { Staking } from '@keplr-wallet/stores';

import useWindowSize from 'src/hooks/useWindowSize';

const tableWidths = ['40%', '40%', '20%'];

interface Props {
	poolId: string;
}

export const MySuperfluidUnbondingTable = observer(function MySuperfluidUnbondingTable({ poolId }: Props) {
	const { chainStore, accountStore, queriesStore } = useStore();

	const { isMobileView } = useWindowSize();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);

	const superfluidUndelegations = queries.osmosis.querySuperfluidUndelegations
		.getQuerySuperfluidDelegations(account.bech32Address)
		.getUndelegations(poolShareCurrency);
	const queryActiveValidators = queries.cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);
	const activeValidators = queryActiveValidators.validators;
	const superfluidDelegatedValidators = activeValidators.filter(activeValidator =>
		superfluidUndelegations?.some(undelegation => undelegation.validator_address === activeValidator.operator_address)
	);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	if (!superfluidUndelegations || (Array.isArray(superfluidUndelegations) && superfluidUndelegations.length === 0)) {
		return null;
	}

	return (
		<React.Fragment>
			<div className="px-5 md:px-0">
				<SubTitleText isMobileView={isMobileView}>My Superfluid Unbondings</SubTitleText>
			</div>
			<table className="w-full">
				<UnlockingTableHeader isMobileView={isMobileView} />
				<tbody className="w-full">
					{superfluidUndelegations &&
						superfluidDelegatedValidators.map((validator, i) => {
							return (
								<UnlockingTableRow
									key={validator.operator_address}
									validatorName={validator.description.moniker}
									amount={superfluidUndelegations[i].amount
										.maxDecimals(6)
										.trim(true)
										.toString()}
									endTime={new Date()}
									isMobileView={isMobileView}
								/>
							);
						})}
				</tbody>
			</table>
		</React.Fragment>
	);
});

interface UnlockingTableHeaderProps {
	isMobileView: boolean;
}

const UnlockingTableHeader = observer(({ isMobileView }: UnlockingTableHeaderProps) => {
	return (
		<thead>
			<TableHeadRow>
				<TableData width={tableWidths[0]}>
					<Text isMobileView={isMobileView}>Validator</Text>
				</TableData>
				<TableData width={tableWidths[1]}>
					<Text isMobileView={isMobileView}>Amount</Text>
				</TableData>
				<TableData width={tableWidths[2]}>
					<Text isMobileView={isMobileView}>Unbonding Complete</Text>
				</TableData>
			</TableHeadRow>
		</thead>
	);
});

interface UnlockingTableRowProps {
	validatorName: string | undefined;
	amount: string;
	endTime: Date;
	isMobileView: boolean;
}

const UnlockingTableRow = observer(function UnlockingTableRow({
	validatorName,
	amount,
	endTime,
	isMobileView,
}: UnlockingTableRowProps) {
	const { chainStore, accountStore } = useStore();

	const endTimeMoment = moment(endTime);

	return (
		<TableBodyRow height={64}>
			<TableData width={tableWidths[0]}>
				<Text emphasis="medium" isMobileView={isMobileView}>
					{validatorName}
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
});
