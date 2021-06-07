import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { AssetsOverview } from '../assets/AssetsOverview';
import moment from 'dayjs';
import { ITokenSynthesis } from './SynthesisList';
import { useHistory, useRouteMatch } from 'react-router-dom';
import times from 'lodash-es/times';
import { MISC } from '../../constants';
import { Img } from '../../components/common/Img';
import { formatNumber } from '../../utils/format';

interface ISynthesisState {
	weight: number[];
	amount: number[];
}

export const BootstrapDetails: FunctionComponent = observer(() => {
	const history = useHistory();
	const match = useRouteMatch<{
		id: string;
	}>();
	const poolNum = match.params?.id;

	React.useEffect(() => {
		if (isNaN(Number(poolNum))) return history.push('/bootstrap');

		// TODO : if bootstrap poolNum not found, display not found
	}, [poolNum, history]);

	// TODO : @Thunnini I don't know why the title is LBP-3
	const title = 'LBP-3';

	// TODO : @Thunnini fetch synthesis data
	const synthesisData = {
		name: 'Regen Network',
		poolTokens: ['REGEN', 'ATOM'],
		tokenChannels: [1, 1],
		baseToken: 'ATOM',
		poolNum: 5,
		currentPrice: 0.6,
		start: {
			time: Date.now(),
			price: 0.4,
			weight: [90, 10],
		},
		end: {
			time: moment()
				.add(7, 'days')
				.valueOf(),
			price: 0.2,
			weight: [50, 50],
		},
	} as ITokenSynthesis;

	// TODO : @Thunnini fetch current synthesis state
	const currentSynthesisState = {
		weight: [85, 15],
		amount: [123456, 3456],
	} as ISynthesisState;

	return (
		<div className="w-full h-full">
			<div className="py-10 w-full px-10">
				<div className="max-w-max mx-auto">
					<AssetsOverview title={title} />
				</div>
			</div>
			<div className="py-7.5 bg-surface w-full px-15">
				<div className="max-w-max mx-auto">
					<PoolStats data={synthesisData} state={currentSynthesisState} />
				</div>
			</div>
		</div>
	);
});

const PoolStats: FunctionComponent<{ data: ITokenSynthesis; state: ISynthesisState }> = ({ data, state }) => {
	return (
		<div>
			<h5 className="mb-7.5">Pool Stats</h5>
			<ul className="flex gap-10">
				{times(state.amount.length, index => (
					<PoolStatItem
						data={{
							index: index,
							token: data.poolTokens[index],
							weight: state.weight[index],
							amount: state.amount[index],
							channelNum: data.tokenChannels[index],
						}}
					/>
				))}
			</ul>
		</div>
	);
};

interface IStatItem {
	index: number;
	token: string;
	weight: number;
	amount: number;
	channelNum: number;
}
const PoolStatItem: FunctionComponent<{ data: IStatItem }> = ({ data }) => {
	return (
		<li className="bg-card rounded-2xl px-7.5 py-6">
			<section className="flex mb-4">
				<figure
					style={{ minWidth: '84px', minHeight: '84px' }}
					className="mr-6 rounded-full border border-enabledGold flex justify-center items-center">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-end',
							MISC.GRADIENT_CLASS[data.index % MISC.GRADIENT_CLASS.length]
						)}>
						<Img className="w-10 h-10 mb-1" src={'/public/assets/Icons/Bubbles.png'} />
					</figure>
				</figure>
				<div style={{ height: '84px' }} className="w-full flex flex-col justify-center items-start">
					<h4>{data.weight}%</h4>
					<p className="mt-1.5 text-white-mid text-sm">
						{data.token} (Channel-{data.channelNum})
					</p>
				</div>
			</section>
			<div>
				<p className="mb-1 text-white-mid text-sm">Total Amount</p>
				<h6>
					{formatNumber(data.amount)} {data.token}
				</h6>
			</div>
		</li>
	);
};
