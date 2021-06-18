import React, { FunctionComponent, useState } from 'react';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { DisplayLeftTime } from '../../components/common/DisplayLeftTime';
import { observer } from 'mobx-react-lite';
import { CreateNewPoolDialog } from '../../dialogs/create-new-pool';
import { useStore } from '../../stores';
import dayjs from 'dayjs';
import { HideCreateNewPool, RewardEpochIdentifier } from '../../config';
import { CoinPretty, DecUtils } from '@keplr-wallet/unit';

export const LabsOverview: FunctionComponent = observer(() => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	return (
		<section>
			<CreateNewPoolDialog
				dialogStyle={{ minWidth: '656px' }}
				isOpen={isDialogOpen}
				close={() => setIsDialogOpen(false)}
			/>
			<div className="flex items-center mb-6">
				<h5 className="mr-0.5">Active Labs</h5>
				{HideCreateNewPool ? null : (
					<button
						onClick={() => setIsDialogOpen(true)}
						className="ml-7 px-4 py-2.5 rounded-lg bg-primary-200 hover:opacity-75 cursor-pointer">
						<p className="leading-none">Create New Pool</p>
					</button>
				)}
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

	const [dummy, setRerender] = React.useState(true);
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

const DispPrice: FunctionComponent = observer(() => {
	const { chainStore, priceStore } = useStore();

	const price = priceStore.calculatePrice(
		'usd',
		new CoinPretty(
			chainStore.current.stakeCurrency,
			DecUtils.getPrecisionDec(chainStore.current.stakeCurrency.coinDecimals)
		)
	);

	return (
		<OverviewLabelValue label="OSMO Price">
			<h4>{price ? price.toString() : '$0'}</h4>
		</OverviewLabelValue>
	);
});
