import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { Spinner } from 'src/components/Spinners';
import { TableBodyRow, TableData, TableHeadRow } from 'src/components/Tables';
import { SubTitleText, Text } from 'src/components/Texts';
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
		<>
			<SubTitleText>My Bondings</SubTitleText>
			<table style={{ width: '100%' }}>
				<LockupTableHeader />
				<tbody style={{ width: '100%' }}>
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
		</>
	);
});

function LockupTableHeader() {
	return (
		<thead>
			<TableHeadRow>
				<TableData width={tableWidths[0]}>
					<Text>Unbonding Duration</Text>
				</TableData>
				<TableData width={tableWidths[1]}>
					<Text>Current APR</Text>
				</TableData>
				<TableData width={tableWidths[2]}>
					<Text>Amount</Text>
				</TableData>
				<TableData width={tableWidths[3]}>
					<Text>Action</Text>
				</TableData>
			</TableHeadRow>
		</thead>
	);
}

interface LockupTableRowProps {
	duration: string;
	apy: string;
	lockup: {
		amount: CoinPretty;
		lockIds: string[];
	};
}

const LockupTableRow = observer(function LockupTableRow({ duration, apy, lockup }: LockupTableRowProps) {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const [isUnlocking, setIsUnlocking] = useState(false);

	return (
		<TableBodyRow>
			<TableData width={tableWidths[0]}>
				<Text emphasis="medium">{duration}</Text>
			</TableData>
			<TableData width={tableWidths[1]}>
				<Text emphasis="medium">{apy}</Text>
			</TableData>
			<TableData width={tableWidths[2]}>
				<Text emphasis="medium">
					{lockup.amount
						.maxDecimals(6)
						.trim(true)
						.toString()}
				</Text>
			</TableData>
			<TableData width={tableWidths[3]}>
				<ButtonFaint
					disabled={!account.isReadyToSendMsgs || lockup.amount.toDec().equals(new Dec(0))}
					onClick={async e => {
						e.preventDefault();

						if (account.isReadyToSendMsgs) {
							try {
								setIsUnlocking(true);

								// XXX: Due to the block gas limit, restrict the number of lock id to included in the one tx.
								await account.osmosis.sendBeginUnlockingMsg(lockup.lockIds.slice(0, 3), '', () => {
									setIsUnlocking(false);
								});
							} catch (e) {
								setIsUnlocking(false);
								console.log(e);
							}
						}
					}}>
					{isUnlocking ? <Spinner /> : <Text color="gold">Unbond All</Text>}
				</ButtonFaint>
			</TableData>
		</TableBodyRow>
	);
});
