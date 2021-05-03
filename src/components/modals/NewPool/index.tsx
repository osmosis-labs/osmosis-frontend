import React, { FunctionComponent } from 'react';
import cn from 'clsx';

const defaultState = {
	pools: [
		{
			token: 'akt',
			ratio: 0.5,
			channel: 'Channel-1',
		},
		{
			token: 'atom',
			ratio: 0.5,
			channel: 'Channel-1',
		},
	],
	stage: 1,
} as IPoolState;
export const NewPool: FunctionComponent = () => {
	const [state, setState] = React.useState<IPoolState>(defaultState);
	return (
		<div
			style={{ width: '533px', height: '656px' }}
			className="bg-surface rounded-2xl pt-8 pb-7.5 px-7.5 text-white-high">
			<div className="pl-4.5">
				<h5 className="mb-4.5">Create New Pool</h5>
				<div className="inline w-full flex items-center">
					<p className="text-sm mr-2.5">Step 1/3 - Set token ratio </p>
					<div className="inline-block rounded-full w-3.5 h-3.5 text-xs bg-secondary-200 flex items-center justify-center text-black">
						!
					</div>
				</div>
			</div>
		</div>
	);
};

export const Pool: FunctionComponent<Record<'data', TPool>> = ({ data }) => {
	return <li />;
};

export interface IPoolState {
	pools: TPool[];
	stage: number;
}
interface TPool {
	token: string;
	ratio: number;
	channel: string;
}
