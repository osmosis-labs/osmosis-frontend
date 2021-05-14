import React, { FunctionComponent, useState } from 'react';
import { IAssetBalance } from './index';
import { formatNumber } from '../../utils/format';
import { Img } from '../../components/common/Img';
import { LINKS, TOKENS } from '../../constants';
import map from 'lodash-es/map';
import { DepositDialog } from '../../dialogs/deposit';
import { WithdrawDialog } from '../../dialogs/Withdraw';

const tableWidths = ['50%', '25%', '12.5%', '12.5%'];
const ROW_HEIGHT = 72;
export const AssetBalancesList: FunctionComponent<{ state: IAssetBalance[] }> = ({ state }) => {
	const [clicked, setClicked] = React.useState<string>('atom');

	const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
	const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
	const closeWithdraw = () => setIsWithdrawDialogOpen(false);
	const closeDeposit = () => setIsDepositDialogOpen(false);

	const onDepositClick = React.useCallback((token: string) => {
		setClicked(token);
		setIsDepositDialogOpen(true);
	}, []);
	const onWithdrawClick = React.useCallback((token: string) => {
		setClicked(token);
		setIsWithdrawDialogOpen(true);
	}, []);
	return (
		<>
			<DepositDialog
				style={{ minHeight: '533px', minWidth: '656px', maxWidth: '656px' }}
				token={clicked}
				isOpen={isDepositDialogOpen}
				close={closeDeposit}
			/>
			<WithdrawDialog
				style={{ minHeight: '533px', minWidth: '656px', maxWidth: '656px' }}
				token={clicked}
				isOpen={isWithdrawDialogOpen}
				close={closeWithdraw}
			/>
			<table className="w-full">
				<AssetBalanceTableHeader />
				<tbody className="w-full">
					{map(state, (rowValue, i) => (
						<AssetBalanceRow
							key={i}
							onDeposit={() => onDepositClick(rowValue.token)}
							onWithdraw={() => onWithdrawClick(rowValue.token)}
							data={rowValue}
							height={ROW_HEIGHT}
						/>
					))}
				</tbody>
			</table>
		</>
	);
};

const AssetBalanceRow: FunctionComponent<{
	data: IAssetBalance;
	height: number;
	onDeposit: () => void;
	onWithdraw: () => void;
}> = ({ data, height, onDeposit, onWithdraw }) => {
	let i = 0;
	return (
		<tr style={{ height: `${height}px` }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<Img loadingSpin className="w-10 h-10" src={LINKS.GET_TOKEN_IMG(data.token)} />
				<p className="ml-5">
					{TOKENS[data.token]?.LONG_NAME} - {data.token.toUpperCase()}
				</p>
			</td>
			<td className="flex items-center justify-end pl-2 pr-20 py-4" style={{ width: tableWidths[i++] }}>
				<p>{formatNumber(data.balance)}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<button onClick={onDeposit} className="flex items-center cursor-pointer hover:opacity-75">
					<p className="text-sm text-secondary-200">Deposit</p>
					<Img src={'/public/assets/Icons/Right.svg'} />
				</button>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<button onClick={onWithdraw} className="flex items-center cursor-pointer hover:opacity-75">
					<p className="text-sm text-secondary-200">Withdraw</p>
					<Img src={'/public/assets/Icons/Right.svg'} />
				</button>
			</td>
		</tr>
	);
};

const AssetBalanceTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl w-full text-white-mid">
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Asset / Chain</p>
				</td>
				<td className="flex items-center justify-end pl-2 pr-20 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Balance</p>
				</td>
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Deposit</p>
				</td>
				<td className="flex items-center px-2 py-4" style={{ width: tableWidths[i++] }}>
					<p className="text-sm leading-normal">Withdraw</p>
				</td>
			</tr>
		</thead>
	);
};
