import React, { FunctionComponent } from 'react';
import { Sidebar } from './Sidebar';

export const RouteWrapper: FunctionComponent = ({ children }) => {
	return (
		<div className="h-full w-full min-h-sidebar-minHeight flex">
			<Sidebar />
			<div className="h-full w-full min-h-sidebar-minHeight flex justify-center text-white-high">{children}</div>
		</div>
	);
};
