import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { formatNumber } from '../../utils/format';
import { IAssets } from './index';
import { formatUSD } from '../../utils/format';

export const AssetsOverview: FunctionComponent<{ state: IAssets }> = ({ state }) => {
	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">My IBC Assets</h4>
			</div>
			<div className="grid grid-cols-3">
				<OverviewLabelValue label="Total Assets">
					<h4 className="inline">{formatUSD(state.total)}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Available Assets">
					<h4 className="inline">{formatUSD(state.available)}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Locked Assets">
					<h4 className="inline">{formatUSD(state.locked)}</h4>
				</OverviewLabelValue>
			</div>
		</section>
	);
};
