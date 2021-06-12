import React, { FunctionComponent } from 'react';

export const OverviewLabelValue: FunctionComponent<Record<'label', string>> = ({ label, children }) => {
	return (
		<li className="flex flex-col">
			<p className="mb-3 text-white-mid">{label}</p>
			{children}
		</li>
	);
};
