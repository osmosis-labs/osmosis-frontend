import React, { FunctionComponent } from 'react';

export const LabsOverview: FunctionComponent = () => {
	return (
		<section className="w-full">
			Labs Overview
			<div className="grid grid-cols-4">
				<div>Liquidity</div>
				<div>Volume</div>
				<div>OSMO Price</div>
				<div>Reward Payout</div>
			</div>
		</section>
	);
};
