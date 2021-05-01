import React, { FunctionComponent } from 'react';
import moment from 'dayjs';
import { formatUSD, getDuration } from '../../utils/format';
import { minus } from '../../utils/Big';
import { MISC } from '../../constants';

export const LabsOverview: FunctionComponent = () => {
	return (
		<section className="w-full">
			<div className="mx-15">
				<div className="flex items-center mb-6">
					<h5 className="mr-0.5">Active Labs</h5>
					<div className="ml-7 px-4 py-2.5 rounded-lg bg-primary-200">
						<p className="leading-none">Create New Pool</p>
					</div>
				</div>
				<ul className="grid grid-cols-4">
					<DispLiquidity />
					<DispDayVolume />
					<DispPrice />
					<DispRewardPayout />
				</ul>
			</div>
		</section>
	);
};

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
		<LabelValue label="Reward Payout">
			<h4 className="flex items-center">
				{day}
				<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
					<h5>D</h5>
				</div>
				{hour}
				<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
					<h5>H</h5>
				</div>
				{minute}
				<div className="inline-block py-1 px-3 h-full rounded-lg bg-card mx-1">
					<h5>M</h5>
				</div>
			</h4>
		</LabelValue>
	);
};

const DispPrice: FunctionComponent = () => {
	// TODO : @Thunnini retrieve osmo price
	const price = 2.58;
	return (
		<LabelValue label="Volume (24h)">
			<h4>{formatUSD(price)}</h4>
		</LabelValue>
	);
};

const DispLiquidity: FunctionComponent = () => {
	// TODO : @Thunnini retrieve liquidity data
	const liquidity = 12253812.53;
	return (
		<LabelValue label="Liquidity">
			<h4>{formatUSD(liquidity)}</h4>
		</LabelValue>
	);
};

const DispDayVolume: FunctionComponent = () => {
	// TODO : @Thunnini retrieve 24h volume
	const dayVolume = 53812.53;
	return (
		<LabelValue label="Volume (24h)">
			<h4>{formatUSD(dayVolume)}</h4>
		</LabelValue>
	);
};

const LabelValue: FunctionComponent<Record<'label', string>> = ({ label, children }) => {
	return (
		<li className="flex flex-col">
			<p className="mb-3 text-white-mid">{label}</p>
			{children}
		</li>
	);
};
