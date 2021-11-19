import styled from '@emotion/styled';
import { ChainIdHelper } from '@keplr-wallet/cosmos';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { Text, TitleText } from 'src/components/Texts';
import { cssAnimateSpin } from 'src/emotionStyles/animations';
import { colorGold } from 'src/emotionStyles/colors';
import { LinkIcon } from 'src/pages/assets/components/LinkIcon';
import { TableData, TableHeaderRow, TableRow } from 'src/pages/assets/components/Table';
import { useStore } from 'src/stores';
import { IBCTransferHistory, IBCTransferHistoryStatus, UncommitedHistory } from '../../stores/ibc-history';
import useWindowSize from 'src/hooks/useWindowSize';

const tableWidths = ['20%', '15%', '15%', '30%', '20%'];
export const IbcTransferHistoryList = observer(function IbcTransferHistoryList() {
	const { ibcTransferHistoryStore, chainStore, accountStore } = useStore();

	const { isMobileView } = useWindowSize();

	const histories = ibcTransferHistoryStore.getHistoriesAndUncommitedHistoriesByAccount(
		accountStore.getAccount(chainStore.current.chainId).bech32Address
	);

	const itemsPerPage = 10;
	const [page, setPage] = useState(1);
	const numPages = Math.ceil(histories.length / itemsPerPage);

	const paginatedHistories = useMemo(() => {
		return histories.slice((page - 1) * itemsPerPage, page * itemsPerPage);
	}, [histories, page, itemsPerPage]);

	return (
		<>
			<div className="px-5 md:px-0">
				<TitleText style={{ paddingTop: isMobileView ? 16 : 40 }} isMobileView={isMobileView}>
					IBC Transaction History
				</TitleText>
			</div>
			<div className="overflow-x-scroll">
				<table className="w-full md:table-fixed">
					<IbcTransferHistoryHeader />
					<tbody>
						{paginatedHistories.map(history => {
							return <IbcTransferHistoryRow key={history.txHash} history={history} />;
						})}
					</tbody>
				</table>
				{numPages > 1 || page !== 1 ? <TablePagination page={page} numPages={numPages} onPageChange={setPage} /> : null}
			</div>
		</>
	);
});

interface IbcTransferHistoryRowProps {
	history: IBCTransferHistory | UncommitedHistory;
}

const IbcTransferHistoryRow = observer(function IbcTransferHistoryRow({ history }: IbcTransferHistoryRowProps) {
	const { chainStore } = useStore();

	return (
		<TableRow>
			<TableData style={{ width: tableWidths[0] }}>
				<Text emphasis="high" style={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60%' }}>
					{history.txHash}
				</Text>
				{chainStore.getChain(history.sourceChainId).raw.explorerUrlToTx ? (
					<a
						href={chainStore
							.getChain(history.sourceChainId)
							.raw.explorerUrlToTx.replace('{txHash}', history.txHash.toUpperCase())}
						target="_blank"
						rel="noopener noreferrer">
						<LinkIcon style={{ color: colorGold, marginLeft: 4 }} size={17} />
					</a>
				) : null}
			</TableData>
			<TableData style={{ width: tableWidths[1] }}>
				{/* If the history is uncommitted (doesn't have sequence), show the alternative pending icon */}
				{'sequence' in history ? (
					<Text emphasis="high">{history.sequence}</Text>
				) : (
					<SpinningImg alt="loading" src="/public/assets/Icons/Loading.png" />
				)}
			</TableData>
			<TableData align="right" style={{ width: tableWidths[2] }}>
				<Text emphasis="high">
					{ChainIdHelper.parse(chainStore.current.chainId).identifier ===
					ChainIdHelper.parse(history.destChainId).identifier
						? 'Deposit'
						: 'Withdraw'}
				</Text>
			</TableData>
			<TableData align="right" style={{ width: tableWidths[3] }}>
				{new CoinPretty(history.amount.currency, new Dec(history.amount.amount))
					.decreasePrecision(history.amount.currency.coinDecimals)
					.maxDecimals(6)
					.trim(true)
					.toString()}
			</TableData>

			<TableData align="right" style={{ width: tableWidths[4] }}>
				<Text emphasis="high" style={{ display: 'flex', alignItems: 'center' }}>
					<StatusTableData status={'status' in history ? history.status : undefined} />
				</Text>
			</TableData>
		</TableRow>
	);
});

function StatusTableData({ status }: { status?: IBCTransferHistoryStatus }) {
	if (status == null) {
		// Uncommitted history has no status.
		// Show pending for uncommitted history..
		return (
			<>
				<SpinningImg alt="loading" src="/public/assets/Icons/Loading.png" />
				Pending
			</>
		);
	}

	switch (status) {
		case 'complete':
			return (
				<>
					<StatusImg alt="success" src="/public/assets/Icons/ToastSuccess.png" />
					Success
				</>
			);
		case 'pending':
			return (
				<>
					<SpinningImg alt="loading" src="/public/assets/Icons/Loading.png" />
					Pending
				</>
			);
		case 'refunded':
			return (
				<>
					<StatusImg alt="failed" src="/public/assets/Icons/FailedTx.png" />
					Refunded
				</>
			);
		case 'timeout':
			return (
				<>
					<SpinningImg alt="loading" src="/public/assets/Icons/Loading.png" />
					Failed: Pending refund
				</>
			);
		default:
			return null;
	}
}

const StatusImg = styled.img`
	width: 20px;
	height: 20px;
	margin-right: 8px;
`;

const SpinningImg = styled(StatusImg)`
	${cssAnimateSpin({ duration: 1500 })}
`;

function IbcTransferHistoryHeader() {
	return (
		<thead>
			<TableHeaderRow>
				<TableData style={{ width: tableWidths[0] }}>
					<Text size="sm">Transaction Hash</Text>
				</TableData>
				<TableData style={{ width: tableWidths[1] }}>
					<Text size="sm">IBC Sequence #</Text>
				</TableData>
				<TableData align="right" style={{ width: tableWidths[2] }}>
					<Text size="sm">Type</Text>
				</TableData>
				<TableData align="right" style={{ width: tableWidths[3] }}>
					<Text size="sm">Amount</Text>
				</TableData>
				<TableData align="right" style={{ width: tableWidths[4] }}>
					<Text size="sm">Status</Text>
				</TableData>
			</TableHeaderRow>
		</thead>
	);
}

const TablePagination: FunctionComponent<{
	page: number;
	numPages: number;
	onPageChange: (page: number) => void;
}> = ({ page, numPages, onPageChange }) => {
	const pageRender = [];

	for (let i = 0; i < numPages; i++) {
		const _page = i + 1;

		pageRender.push(
			<PaginationButton
				type="button"
				key={_page.toString()}
				onClick={() => onPageChange(_page)}
				selected={_page === page}>
				<Text color="gold" size="sm">
					{_page}
				</Text>
			</PaginationButton>
		);
	}

	return <TablePaginationContainer>{pageRender}</TablePaginationContainer>;
};

const TablePaginationContainer = styled.div`
	display: flex;
	width: 100%;
	padding: 1rem;
	align-items: center;
	justify-content: center;
`;

const PaginationButton = styled(ButtonFaint)<{ selected?: boolean }>`
	display: flex;
	align-items: center;
	border-radius: 0.375rem;
	height: 2.25rem;
	padding-left: 12px;
	padding-right: 12px;
	${({ selected = false }) => (selected ? { border: `1px solid ${colorGold}` } : null)}
`;
