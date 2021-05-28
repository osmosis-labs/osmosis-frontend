import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { formatNumber, getDuration } from '../../utils/format';
import { minus, multiply } from '../../utils/Big';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import moment from 'dayjs';
import utc from 'dayjs/plugin/utc';
moment.extend(utc);
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { IGovernanceState } from './index';

export const GovernanceOverview: FunctionComponent<{ state: IGovernanceState }> = ({ state }) => {
	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">Osmosis Governance</h4>
			</div>
			<div className="flex items-center gap-21.5">
				<OverviewLabelValue label="Active Validators">
					<div className="inline">
						<h4 className="inline">{formatNumber(state.activeValidators)}</h4>
					</div>
				</OverviewLabelValue>
				<OverviewLabelValue label="Staking reward %">
					<div className="inline">
						<h4 className="inline">{multiply(state.stakingRewards, 100, 2)}%</h4>
					</div>
				</OverviewLabelValue>
				<DisplayCliff cliff={state.cliff} />
			</div>
		</section>
	);
};

const DisplayCliff: FunctionComponent<{ cliff: number }> = ({ cliff }) => {
	const [dummy, setRerender] = React.useState(true);
	React.useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const payoutTime = React.useMemo(() => {
		return getDuration(Number(minus(cliff, moment().valueOf()))).format('DD-HH-mm');
	}, [dummy]);
	const [day, hour, minute] = payoutTime.split('-');
	return (
		<OverviewLabelValue label="Cliff">
			<DisplayLeftTime day={day} hour={hour} minute={minute} />
		</OverviewLabelValue>
	);
};
