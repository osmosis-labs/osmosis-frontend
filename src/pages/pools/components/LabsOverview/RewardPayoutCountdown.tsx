import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DisplayLeftTime } from 'src/components/common/DisplayLeftTime';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { RewardEpochIdentifier } from 'src/config';
import { useStore } from 'src/stores';

export const RewardPayoutCountdown = observer(function RewardPayoutCountdown() {
	const { chainStore, queriesStore } = useStore();

	const queryEpoch = queriesStore.get(chainStore.current.chainId).osmosis.queryEpochs.getEpoch(RewardEpochIdentifier);

	const [, setRerender] = React.useState(true);
	React.useEffect(() => {
		const interval = setInterval(() => {
			setRerender(v => !v);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const payoutTime = (() => {
		// TODO: duration이 딱 끝나고 남은 시간이 0이나 음수가 될 때 어떻게 될 지 모르겠슴...
		const delta = dayjs.duration(dayjs(queryEpoch.endTime).diff(dayjs(new Date()), 'second'), 'second');
		if (delta.asSeconds() <= 0) {
			return '00-00-00';
		}
		return delta.format('DD-HH-mm');
	})();
	const [day, hour, minute] = payoutTime.split('-');
	return (
		<OverviewLabelValue label="Reward distribution in">
			<DisplayLeftTime day={day} hour={hour} minute={minute} />
		</OverviewLabelValue>
	);
});
