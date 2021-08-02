import React, { FunctionComponent, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { IBCTransferHistory } from '../../stores/ibc-history';
import { useStore } from '../../stores';
import { ChainIdHelper } from '@keplr-wallet/cosmos';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import clsx from 'clsx';

const LinkIcon: FunctionComponent<React.SVGAttributes<SVGElement> | { className: string }> = props => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 15 15" {...props}>
			<path
				fill="currentColor"
				d="M13.588.794a.598.598 0 00-.066.006H10A.6.6 0 1010 2h2.152L5.976 8.176a.6.6 0 10.848.848L13 2.848V5a.601.601 0 001.157.232A.6.6 0 0014.2 5V1.476a.598.598 0 00-.612-.682zM1.6 3.2C.944 3.2.4 3.744.4 4.4v9c0 .656.544 1.2 1.2 1.2h9c.656 0 1.2-.544 1.2-1.2V5.853l-1.2 1.2V13.4h-9v-9H7.947l1.2-1.2H1.6z"
			/>
		</svg>
	);
};

const tableWidths = ['20%', '15%', '15%', '30%', '20%'];
export const IBCTransferHistoryTable: FunctionComponent = observer(() => {
	const { ibcTransferHistoryStore, chainStore, accountStore } = useStore();

	const histories = ibcTransferHistoryStore.getHistoriesByAccount(
		accountStore.getAccount(chainStore.current.chainId).bech32Address
	);

	const itemsPerPage = 10;
	const [page, setPage] = useState(1);
	const numPages = Math.ceil(histories.length / itemsPerPage);

	const paginatedHistories = useMemo(() => {
		return histories.slice((page - 1) * itemsPerPage, page * itemsPerPage);
	}, [histories, page, itemsPerPage]);

	return (
		<React.Fragment>
			<h5 className="mb-5">Pending IBC Transactions</h5>
			<table className="w-full">
				<IBCTransferHistoryTableHeader />
				<tbody className="w-full">
					{paginatedHistories.map(history => {
						return <IBCTransferHistoryTableRow key={history.txHash} history={history} />;
					})}
				</tbody>
			</table>
			{numPages > 1 || page !== 1 ? <TablePagination page={page} numPages={numPages} onPageChange={setPage} /> : null}
		</React.Fragment>
	);
});

export const IBCTransferHistoryTableRow: FunctionComponent<{
	history: IBCTransferHistory;
}> = observer(({ history }) => {
	const { chainStore } = useStore();

	let i = 0;
	return (
		<tr style={{ height: '4.5rem' }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center justify-start px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p
					style={{
						whiteSpace: 'nowrap',
						textOverflow: 'ellipsis',
						overflow: 'hidden',
						maxWidth: '60%',
					}}>
					{history.txHash}
				</p>
				{chainStore.getChain(history.sourceChainId).raw.explorerUrlToTx ? (
					<a
						href={chainStore.getChain(history.sourceChainId).raw.explorerUrlToTx.replace('{txHash}', history.txHash)}
						target="_blank"
						rel="noopener noreferrer">
						<LinkIcon className="text-secondary-200 ml-1" width="17" height="17" />
					</a>
				) : null}
			</td>
			<td className="flex items-center justify-start px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{history.sequence}</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>
					{ChainIdHelper.parse(chainStore.current.chainId).identifier ===
					ChainIdHelper.parse(history.destChainId).identifier
						? 'Deposit'
						: 'Withdraw'}
				</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				{new CoinPretty(history.amount.currency, new Dec(history.amount.amount))
					.decreasePrecision(history.amount.currency.coinDecimals)
					.maxDecimals(6)
					.trim(true)
					.toString()}
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				{(() => {
					switch (history.status) {
						case 'complete':
							return (
								<React.Fragment>
									<img
										alt="ldg"
										style={{ width: '20px', height: '20px', marginRight: '8px' }}
										src="/public/assets/Icons/ToastSuccess.png"
									/>
									Success
								</React.Fragment>
							);
						case 'pending':
							return (
								<React.Fragment>
									<img
										alt="ldg"
										className="s-spin"
										style={{ width: '20px', height: '20px', marginRight: '8px' }}
										src="/public/assets/Icons/Loading.png"
									/>
									Pending
								</React.Fragment>
							);
						case 'refunded':
							return (
								<React.Fragment>
									<img
										alt="ldg"
										style={{ width: '20px', height: '20px', marginRight: '8px' }}
										src="/public/assets/Icons/FailedTx.png"
									/>
									Refunded
								</React.Fragment>
							);
						case 'timeout':
							return (
								<React.Fragment>
									<img
										alt="ldg"
										className="s-spin"
										style={{ width: '20px', height: '20px', marginRight: '8px' }}
										src="/public/assets/Icons/Loading.png"
									/>
									Failed: Pending refund
								</React.Fragment>
							);
					}
				})()}
			</td>
		</tr>
	);
});

export const IBCTransferHistoryTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl w-full text-white-mid">
				<td className="flex items-center justify-start px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Transaction Hash</p>
				</td>
				<td className="flex items-center justify-start px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">IBC Sequence #</p>
				</td>
				<td className="flex items-center justify-end px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Type</p>
				</td>
				<td className="flex items-center justify-end px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Amount</p>
				</td>
				<td className="flex items-center justify-end px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Status</p>
				</td>
			</tr>
		</thead>
	);
};

const TablePagination: FunctionComponent<{
	page: number;
	numPages: number;
	onPageChange: (page: number) => void;
}> = ({ page, numPages, onPageChange }) => {
	const pageRender = [];

	for (let i = 0; i < numPages; i++) {
		const _page = i + 1;

		pageRender.push(
			<button
				key={_page.toString()}
				onClick={e => {
					e.preventDefault();

					onPageChange(_page);
				}}
				className={clsx('flex items-center rounded-md h-9 px-3 text-sm text-secondary-200', {
					'border border-secondary-200': _page === page,
				})}>
				<p>{_page}</p>
			</button>
		);
	}

	return <div className="w-full p-4 flex items-center justify-center">{pageRender}</div>;
};
