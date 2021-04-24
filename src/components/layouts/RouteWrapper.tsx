import React, { FunctionComponent } from 'react';
import Sidebar from './Sidebar';

export const RouteWrapper: FunctionComponent = ({ children }) => {
	return (
		<div className="h-full w-full min-w-screen-md lg:min-w-screen-lg min-h-sidebar-minHeight flex text-white-high">
			<Sidebar />
			{children}
		</div>
	);
};
