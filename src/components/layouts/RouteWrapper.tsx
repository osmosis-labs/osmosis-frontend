import React, { FunctionComponent } from 'react';
import { Sidebar } from './Sidebar';

export const RouteWrapper: FunctionComponent = ({ children }) => {
	return (
		<div className="h-fit md:h-full w-full flex">
			<Sidebar />
			<div className="h-fit md:h-full w-full flex justify-center text-white-high">{children}</div>
		</div>
	);
};
