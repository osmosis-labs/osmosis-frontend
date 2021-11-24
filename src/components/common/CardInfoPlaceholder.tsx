import React, { FunctionComponent } from 'react';

export const CardInfoPlaceholder: FunctionComponent<{
	className: string;
}> = ({ className }) => {
	return (
		<div className={`${className} relative overflow-hidden rounded-sm my-0.25`}>
			<div className="loading-animation" />
		</div>
	);
};
