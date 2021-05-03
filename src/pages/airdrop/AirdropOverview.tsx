import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import moment from 'dayjs';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { formatNumber, getDuration } from '../../utils/format';
import { minus } from '../../utils/Big';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { TAirdopState } from './useAirdropData';

export const AirdropOverview: FunctionComponent<IAirdropOverview> = ({ state }) => {
	return (
		<section className="w-full">
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">Claim Airdrop</h4>
			</div>
			<div className="grid grid-cols-3">
				<OverviewLabelValue label="Total Claimed">
					<div className="inline">
						<h4 className="inline">{formatNumber(state.claimed)}</h4>
						<h6 className="inline"> OSMO</h6>
					</div>
				</OverviewLabelValue>
				<OverviewLabelValue label="Total Unclaimed">
					<div className="inline">
						<h4 className="inline">{formatNumber(state.total - state.claimed)}</h4>
						<h6 className="inline"> OSMO</h6>
					</div>
				</OverviewLabelValue>
				<DisplayCliff cliff={state.cliff} />
			</div>
		</section>
	);
};
interface IAirdropOverview {
	state: TAirdopState;
}

const DisplayCliff: FunctionComponent<Record<'cliff', number>> = ({ cliff }) => {
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
