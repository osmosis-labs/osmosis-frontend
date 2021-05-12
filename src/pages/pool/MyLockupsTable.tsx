import times from 'lodash-es/times';
import React, { FunctionComponent } from 'react';
import map from 'lodash-es/map';
import { fixed } from '../../utils/Big';

// TODO : @Thunnini fetch lockup data instead
const lockupData: ILockupRow[] = times(3, i => ({
	duration: (i + 1) * 30,
	token: 'LP-Token',
	amount: 300,
	pendingRewards: 42.3103,
	currentApy: 353.21,
}));

const tableWidths = ['20%', '20%', '20%', '20%', '20%'];
export const MyLockupsTable: FunctionComponent = () => {
	return (
		<>
			<h6 className="mb-1">My Lockups</h6>
			<table className="w-full">
				<LockupTableHeader />
				<tbody className="w-full">
					{map(lockupData, (rowValue, i) => (
						<LockupTableRow key={i} data={rowValue} height={76} />
					))}
				</tbody>
			</table>
		</>
	);
};

const LockupTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl mt-5 w-full text-white-mid">
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Lock Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Current APY</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Amount</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Pending Rewards</p>
				</td>
				<td className="flex items-center px-2 py-3 justify-end" style={{ width: tableWidths[i++] }}>
					<p>Action</p>
				</td>
			</tr>
		</thead>
	);
};

const LockupTableRow: FunctionComponent<ILockupTableRow> = ({ data, height }) => {
	let i = 0;
	return (
		<tr style={{ height: `${height}px` }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{data.duration} day</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{fixed(data.currentApy, 2)}%</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>
					{data.amount} {data.token}
				</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{data.pendingRewards} OSMO</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<button onClick={() => alert('Unlock flow')}>
					<p className="text-enabledGold">Unlock</p>
				</button>
			</td>
		</tr>
	);
};

interface ILockupTableRow {
	data: ILockupRow;
	height: number;
}

interface ILockupRow {
	duration: number;
	token: string;
	amount: number;
	currentApy: number;
	pendingRewards: number;
}
