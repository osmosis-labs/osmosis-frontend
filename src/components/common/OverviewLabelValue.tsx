import React, { FunctionComponent } from 'react';

export const OverviewLabelValue: FunctionComponent<Record<'label', string>> = ({ label, children }) => {
	return (
		<div className="flex flex-col">
			<p className="mb-2.5 md:mb-3 text-sm md:text-base text-white-mid whitespace-nowrap">{label}</p>
			{children}
		</div>
	);
};
