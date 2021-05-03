import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { TAirdopState } from './useAirdropData';
import { formatNumber } from '../../utils/format';
import { multiply } from '../../utils/Big';

export const MyAirdropProgress: FunctionComponent<IMyAirdropProgress> = ({ state }) => {
	const percent = multiply(state.claimed / state.total, 100, 2);
	return (
		<>
			<h5 className="mb-2 font-normal">My Progress</h5>
			<div className="w-full mb-4.5">
				<div className="w-full flex justify-between items-end">
					<p>
						{formatNumber(state.claimed)} <span className="text-xs">OSMO</span> / {formatNumber(state.total)}{' '}
						<span className="text-xs">OSMO</span>
					</p>
					<h4>{percent}%</h4>
				</div>
				<div className="w-full relative h-3 rounded-2xl bg-background mt-2.5">
					<div
						style={{
							width: `${percent}%`,
							background: 'linear-gradient(270deg, #89EAFB 0%, #1377B0 100%)',
						}}
						className="absolute rounded-2xl h-3 left-0 top-0"
					/>
				</div>
			</div>
			<div>
				<button className="py-2.5 px-6 bg-white-disabled rounded-lg hover:opacity-75 cursor-pointer">
					<p>Claim Reward</p>
				</button>
			</div>
		</>
	);
};

interface IMyAirdropProgress {
	state: TAirdopState;
}
