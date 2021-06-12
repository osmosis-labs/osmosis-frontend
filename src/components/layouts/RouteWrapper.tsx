import React, { FunctionComponent } from 'react';
import { Sidebar } from './Sidebar';

export const RouteWrapper: FunctionComponent = ({ children }) => {
	return (
		<div className="h-full w-full min-h-sidebar-minHeight flex text-white-high">
			<Sidebar />
			{children}
		</div>
	);
};
