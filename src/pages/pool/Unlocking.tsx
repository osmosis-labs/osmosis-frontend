import times from 'lodash-es/times';
import React, { FunctionComponent } from 'react';
import map from 'lodash-es/map';
import { fixed } from '../../utils/Big';
import moment from 'dayjs';
import utc from 'dayjs/plugin/utc';
moment.extend(utc);

const unlockingData: IUnlockingRow[] = times(3, i => ({
	duration: 30,
	amount: 300,
	unlockUnixTimestamp: moment().unix(),
}));

const tableWidths = ['40%', '40%', '20%'];
export const UnlockingTable: FunctionComponent = () => {
	return (
		<>
			<h6 className="mb-1">Unlocking</h6>
			<table className="w-full">
				<UnlockingTableHeader />
				<tbody className="w-full">
					{map(unlockingData, (data, i) => (
						<UnlockingTableRow key={i} data={data} height={64} />
					))}
				</tbody>
			</table>
		</>
	);
};

const UnlockingTableHeader: FunctionComponent = () => {
	let i = 0;
	return (
		<thead>
			<tr className="flex items-center w-full border-b pl-12.5 pr-15 bg-card rounded-t-2xl mt-5 w-full text-white-mid">
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Lock Duration</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Amount</p>
				</td>
				<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
					<p>Unlock Complete</p>
				</td>
			</tr>
		</thead>
	);
};

const UnlockingTableRow: FunctionComponent<IUnlockingTableRow> = ({ data, height }) => {
	let i = 0;
	return (
		<tr style={{ height: `${height}px` }} className="flex items-center w-full border-b pl-12.5 pr-15">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{data.duration} day</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{fixed(data.amount, 2)} LP-Token</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>
					{moment(data.unlockUnixTimestamp * 1000)
						.utc()
						.format('YYYY/M/DD HH:mm A UTC')}
				</p>
			</td>
		</tr>
	);
};

interface IUnlockingTableRow {
	data: IUnlockingRow;
	height: number;
}

interface IUnlockingRow {
	duration: number;
	amount: number;
	unlockUnixTimestamp: number; //	 unix timestamp
}
