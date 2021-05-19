import React, { FunctionComponent, useState } from 'react';
import { formatUSD } from '../../utils/format';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { observer } from 'mobx-react-lite';
import { CreateNewPoolDialog } from '../../dialogs/create-new-pool';
import { useStore } from '../../stores';
import dayjs from 'dayjs';
import { RewardEpochIdentifier } from '../../config';

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

const DispRewardPayout: FunctionComponent = observer(() => {
	const { chainStore, queriesStore } = useStore();

	const queryEpoch = queriesStore.get(chainStore.current.chainId).osmosis.queryEpochs.getEpoch(RewardEpochIdentifier);
	// XXX: 밑의 payoutTime이 memo를 통해서 계산되기 때문에 만약 밑의 메모에서 직접 queryEpoch.endTime을 사용한다면
	// observed 상태가 되지 않는다. 값이 observed 상태가 되지 않으면 사용될 때마다 fetch가 되기 때문에 이 문제를 해결하기 위해서
	// 밑의 라인을 통해서 endTime을 매 render 마다 불러오게 만든다.
	const endTime = queryEpoch.endTime;

	const [dummy, setRerender] = React.useState(true);
	React.useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const payoutTime = React.useMemo(() => {
		// TODO: duration이 딱 끝나고 남은 시간이 0이나 음수가 될 때 어떻게 될 지 모르겠슴...
		const delta = dayjs.duration(dayjs(endTime).diff(dayjs(new Date()), 'second'), 'second');
		if (delta.asSeconds() <= 0) {
			return '00-00-00';
		}
		return delta.format('DD-HH-mm');
	}, [dummy]);
	const [day, hour, minute] = payoutTime.split('-');
	return (
		<OverviewLabelValue label="Reward Payout">
			<DisplayLeftTime day={day} hour={hour} minute={minute} />
		</OverviewLabelValue>
	);
});

const DispPrice: FunctionComponent = () => {
	// TODO : @Thunnini retrieve osmo price
	const price = 2.58;
	return (
		<OverviewLabelValue label="OSMO Price">
			<h4>{formatUSD(price)}</h4>
		</OverviewLabelValue>
	);
};
