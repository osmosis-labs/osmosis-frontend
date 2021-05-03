import React, { FunctionComponent } from 'react';
import times from 'lodash-es/times';
import map from 'lodash-es/map';
import cn from 'clsx';

const defaultData = times(7, i => {
	return {
		num: i + 1,
		description: 'Vote on a Osmosis governace proposal',
		complete: Math.random() < 0.7,
	} as IMission;
});

export const AirdropMissions: FunctionComponent = () => {
	// TODO : @Thunnini fetch mission data / status
	const [data] = React.useState<IMission[]>(defaultData);

	return (
		<div className="w-full">
			<h5>Missions</h5>
			<ul className="flex flex-col gap-2.5 mt-7.5">
				{map(data, mission => (
					<MissionCard key={mission.num} data={mission} />
				))}
			</ul>
		</div>
	);
};

const MissionCard: FunctionComponent<Record<'data', IMission>> = ({ data }) => {
	return (
		<li className="w-full rounded-2xl border border-white-faint py-5 px-7.5">
			<div className="flex justify-between items-center">
				<div>
					<p className="mb-1.5">Mission #{data.num}</p>
					<h6>{data.description}</h6>
				</div>
				<h6 className={cn(data.complete ? 'text-pass' : 'text-missionError')}>
					{data.complete ? 'Complete' : 'Not Complete'}
				</h6>
			</div>
		</li>
	);
};

interface IMission {
	num: number;
	description: string;
	complete: boolean;
}
