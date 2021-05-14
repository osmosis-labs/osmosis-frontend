import React, { FunctionComponent, useState } from 'react';
import moment from 'dayjs';
import { formatUSD, getDuration } from '../../utils/format';
import { minus } from '../../utils/Big';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { TModal } from '../../interfaces';
import { CreateNewPoolDialog } from '../../dialogs/create-new-pool';

export const LabsOverview: FunctionComponent = observer(() => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	return (
		<section>
			<CreateNewPoolDialog style={{ minWidth: '656px' }} isOpen={isDialogOpen} close={() => setIsDialogOpen(false)} />
			<div className="flex items-center mb-6">
				<h5 className="mr-0.5">Active Labs</h5>
				<button
					onClick={() => setIsDialogOpen(true)}
					className="ml-7 px-4 py-2.5 rounded-lg bg-primary-200 hover:opacity-75 cursor-pointer">
					<p className="leading-none">Create New Pool</p>
				</button>
			</div>
			<ul className="flex items-center gap-20">
				<DispPrice />
				<DispRewardPayout />
			</ul>
		</section>
	);
});

const DispRewardPayout: FunctionComponent = () => {
	const [dummy, setRerender] = React.useState(true);
	React.useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// TODO : @Thunnini retrieve payout timestamp in unix
	const payoutTimestamp = React.useMemo(
		() =>
			moment()
				.add(Math.random() * 96 + 48, 'hour')
				.valueOf(),
		[]
	);

	const payoutTime = React.useMemo(() => {
		return getDuration(Number(minus(payoutTimestamp, moment().valueOf()))).format('DD-HH-mm');
	}, [dummy]);
	const [day, hour, minute] = payoutTime.split('-');
	return (
		<OverviewLabelValue label="Reward Payout">
			<DisplayLeftTime day={day} hour={hour} minute={minute} />
		</OverviewLabelValue>
	);
};

const DispPrice: FunctionComponent = () => {
	// TODO : @Thunnini retrieve osmo price
	const price = 2.58;
	return (
		<OverviewLabelValue label="OSMO Price">
			<h4>{formatUSD(price)}</h4>
		</OverviewLabelValue>
	);
};
