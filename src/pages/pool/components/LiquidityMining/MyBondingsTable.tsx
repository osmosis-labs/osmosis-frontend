import styled from '@emotion/styled';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { TToastType, useToast } from 'src/components/common/toasts';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { SubTitleText, Text } from 'src/components/Texts';
import { colorPrimary } from 'src/emotionStyles/colors';
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
			<LockupTableHeadRow>
				<LockupTableData width={tableWidths[0]}>
					<Text>Bonding Duration</Text>
				</LockupTableData>
				<LockupTableData width={tableWidths[1]}>
					<Text>Current APR</Text>
				</LockupTableData>
				<LockupTableData width={tableWidths[2]}>
					<Text>Amount</Text>
				</LockupTableData>
				<LockupTableData width={tableWidths[3]}>
					<Text>Action</Text>
				</LockupTableData>
			</LockupTableHeadRow>
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

	const toast = useToast();

	return (
		<LockupTableBodyRow>
			<LockupTableData width={tableWidths[0]}>
				<Text emphasis="medium">{duration}</Text>
			</LockupTableData>
			<LockupTableData width={tableWidths[1]}>
				<Text emphasis="medium">{apy}</Text>
			</LockupTableData>
			<LockupTableData width={tableWidths[2]}>
				<Text emphasis="medium">
					{lockup.amount
						.maxDecimals(6)
						.trim(true)
						.toString()}
				</Text>
			</LockupTableData>
			<LockupTableData width={tableWidths[3]}>
				<ButtonFaint
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
					{isUnlocking ? <Spinner /> : <Text color="secondary">Unbond All</Text>}
				</ButtonFaint>
			</LockupTableData>
		</LockupTableBodyRow>
	);
});

const TableRowBaseStyled = styled.tr`
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom-width: 1px;
	padding-left: 50px;
	padding-right: 60px;
`;

const LockupTableData = styled.td`
	display: flex;
	align-items: center;
	padding: 12px 8px;
`;

const LockupTableHeadRow = styled(TableRowBaseStyled)`
	background-color: ${colorPrimary};
	border-top-left-radius: 1rem;
	border-top-right-radius: 1rem;
	margin-top: 20px;
`;

const LockupTableBodyRow = styled(TableRowBaseStyled)`
	height: 76px;
`;

function Spinner() {
	return (
		<SpinnerSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" />
			<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
		</SpinnerSvg>
	);
}

const SpinnerSvg = styled.svg`
	animation: spin 1s linear infinite;
	margin-left: -4px;
	margin-right: 12px;
	height: 1.25rem;
	width: 1.25rem;
	fill: none;

	& > circle {
		opacity: 0.25;
		stroke-width: 4;
		stroke: currentColor;
	}

	& > path {
		fill: currentColor;
		opacity: 0.75;
	}
`;
