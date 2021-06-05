import React, { FunctionComponent } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { formatNumber } from '../../utils/format';
import { IAssets } from './index';
import { formatUSD } from '../../utils/format';

export const AssetsOverview: FunctionComponent<{ title: string }> = ({ title }) => {
	// TODO : @Thunnini retrieve asset amounts
	const state = { total: 12530, available: 2896, locked: 9544 } as IAssets;
	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">{title}</h4>
			</div>
			<div className="flex items-center gap-21.5">
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
