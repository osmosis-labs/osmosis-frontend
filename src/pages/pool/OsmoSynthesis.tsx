import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { QueriedPoolBase } from '../../stores/osmosis/query/pool';
import { multiply } from '../../utils/Big';
import { formatNumber } from '../../utils/format';
import times from 'lodash-es/times';
import map from 'lodash-es/map';

export const OsmoSynthesis: FunctionComponent<IOsmoSynthesis> = ({ pool }) => {
	const totalShare = pool.totalShare.toString();

	// TODO : calculate / fetch price per token
	const price = 2.48;

	const onStartEarnClick = React.useCallback(() => {
		alert('need implementing');
	}, []);
	return (
		<section>
			<div className="flex justify-between items-start">
				<div>
					<h5 className="mb-3">OSMO Synthesis</h5>
					<p className="text-white-mid">
						Commit to locking your LP tokens for a certain period of time to
						<br />
						earn OSMO tokens and participate in Pool governance
					</p>
				</div>
				<div className="flex flex-col items-end">
					<p className="text-white-mid mb-3">Available LP tokens</p>
					<h5 className="text-right mb-4">${formatNumber(multiply(totalShare, price, 2))}</h5>
					<button onClick={onStartEarnClick} className="px-8 py-2.5 bg-primary-200 rounded-lg leading-none">
						<p>Start Earning</p>
					</button>
				</div>
			</div>
			<div className="mt-10 grid grid-cols-3 gap-9">
				<LockupBox apyPercent={356} days={30} />
				<LockupBox apyPercent={356} days={60} />
				<LockupBox apyPercent={356} days={90} />
			</div>
			<div className="mt-10">
				<LockupTable />
			</div>
		</section>
	);
};

// TODO : @Thunnini fetch lockup data instead
const lockupData: ILockupRow[] = times(3, i => ({
	num: i + 1,
	token: 'LP-Token',
	amount: 300,
	dollarValue: 24350.831,
}));

const tableWidths = ['10%', '30%', '30%', '35%'];
const LockupTable: FunctionComponent = () => {
	return (
		<>
			<h6 className="mb-1">My Lockups</h6>
			<table className="w-full">
				<tbody className="w-full">
					{map(lockupData, rowValue => (
						<LockupTableRow data={rowValue} />
					))}
				</tbody>
			</table>
		</>
	);
};

const LockupTableRow: FunctionComponent<Record<'data', ILockupRow>> = ({ data }) => {
	let i = 0;
	return (
		<tr className="flex items-center w-full border-b px-8">
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p className="text-white-disabled">{data.num}</p>
			</td>
			<td className="flex items-center px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>
					{data.amount} {data.token}
				</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>{data.amount}</p>
			</td>
			<td className="flex items-center justify-end px-2 py-3" style={{ width: tableWidths[i++] }}>
				<p>${data.dollarValue}</p>
			</td>
		</tr>
	);
};
interface ILockupRow {
	num: number;
	token: string;
	amount: number;
	dollarValue: number;
}

const LockupBox: FunctionComponent<ILockupBox> = ({ days, apyPercent }) => {
	return (
		<div className="bg-card rounded-2xl pt-7 px-7.5 pb-10">
			<h4 className="mb-4 font-normal">{days} days lockup</h4>
			<h6 className="text-secondary-200 font-normal">APY {apyPercent}%</h6>
		</div>
	);
};
interface ILockupBox {
	days: number;
	apyPercent: number;
}

interface IOsmoSynthesis {
	pool: QueriedPoolBase;
}
