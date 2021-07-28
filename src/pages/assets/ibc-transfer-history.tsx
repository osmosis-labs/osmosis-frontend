import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { IBCTransferHistory } from '../../stores/ibc-history';
import { useStore } from '../../stores';
import { ChainIdHelper } from '@keplr-wallet/cosmos';
import { CoinPretty, Dec } from '@keplr-wallet/unit';

const tableWidths = ['20%', '15%', '15%', '30%', '20%'];
export const IBCTransferHistoryTable: FunctionComponent = observer(() => {
	const { ibcTransferHistoryStore } = useStore();

	return (
		<table className="w-full">
			<IBCTransferHistoryTableHeader />
			<tbody className="w-full">
				{ibcTransferHistoryStore.histories.map(history => {
					return <IBCTransferHistoryTableRow key={history.txHash} history={history} />;
				})}
			</tbody>
		</table>
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
				<p>{history.txHash}</p>
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
				{history.status}
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
