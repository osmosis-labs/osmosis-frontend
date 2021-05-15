import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { QueriedPoolBase } from '../../stores/osmosis/query/pool';
import { fixed, multiply } from '../../utils/Big';
import { formatNumber } from '../../utils/format';
import { MyLockupsTable } from './MyLockupsTable';
import { UnlockingTable } from './Unlocking';

export const OsmoSynthesis: FunctionComponent<IOsmoSynthesis> = ({ pool }) => {
	const totalShare = pool.totalShare.toString();

	// TODO : calculate / fetch price per token
	const price = 2.48;

	const onStartEarnClick = React.useCallback(() => {
		alert('need implementing');
	}, []);
	return (
		<section className="max-w-max mx-auto">
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
					<button
						onClick={onStartEarnClick}
						className="px-8 py-2.5 bg-primary-200 rounded-lg leading-none hover:opacity-75">
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
				<MyLockupsTable />
			</div>
			<div className="mt-10">
				<UnlockingTable />
			</div>
		</section>
	);
};

const LockupBox: FunctionComponent<ILockupBox> = ({ days, apyPercent }) => {
	return (
		<div className="bg-card rounded-2xl pt-7 px-7.5 pb-10">
			<h4 className="mb-4 font-normal text-xl xl:text-2xl">{days} days lockup</h4>
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
