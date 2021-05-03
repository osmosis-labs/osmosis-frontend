import React, { FunctionComponent } from 'react';
import cn from 'clsx';

export const DisplayLeftTime: FunctionComponent<IDisplayLeftTime> = ({ day, hour, minute }) => {
	return (
		<h4 className="flex items-center">
			{day}
			<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
				<h5>D</h5>
			</div>
			{hour}
			<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
				<h5>H</h5>
			</div>
			{minute}
			<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
				<h5>M</h5>
			</div>
		</h4>
	);
};

interface IDisplayLeftTime {
	day: string;
	hour: string;
	minute: string;
}
