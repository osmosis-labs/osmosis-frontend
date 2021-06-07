import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import moment from 'dayjs';
import utc from 'dayjs/plugin/utc';
import map from 'lodash-es/map';
import cn from 'clsx';
import { MISC } from '../../constants';
import { Img } from '../../components/common/Img';
import { useHistory } from 'react-router-dom';

moment.extend(utc);

export interface ITokenSynthesis {
	name: string;
	poolTokens: string[];
	tokenChannels: number[];
	baseToken: string;
	poolNum: number;
	currentPrice: number;
	start: ITokenState;
	end: ITokenState;
}
interface ITokenState {
	time: number; // unix timestamp
	price: number;
	weight: number[];
}

export const SynthesisList: FunctionComponent = observer(() => {
	// TODO : @Thunnini fetch synthesis data
	const synthesisData = [
		{
			name: 'Regen Network',
			poolTokens: ['REGEN', 'ATOM'],
			tokenChannels: [1, 1], //	used in details
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
		} as ITokenSynthesis,
	];

	return (
		<ul>
			{map(synthesisData, (item, index) => (
				<SynthesisItem key={index} data={item} index={index} />
			))}
		</ul>
	);
});

const SynthesisItem: FunctionComponent<{ data: ITokenSynthesis; index: number }> = ({ data, index }) => {
	const history = useHistory();
	return (
		<li className="w-full rounded-2xl p-7.5 bg-card">
			<section className="flex mb-5">
				<figure
					style={{ minWidth: '84px', minHeight: '84px' }}
					className="mr-7.5 rounded-full border border-enabledGold flex justify-center items-center">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-end',
							MISC.GRADIENT_CLASS[index % MISC.GRADIENT_CLASS.length]
						)}>
						<Img className="w-10 h-10 mb-1" src={'/public/assets/Icons/Bubbles.png'} />
					</figure>
				</figure>
				<div style={{ height: '84px' }} className="w-full flex flex-col justify-center items-start">
					<div className="w-full flex justify-between items-center mb-2">
						<p className="text-sm font-semibold text-white-mid">
							{data.poolTokens.join('/')} (Pool-{data.poolNum})
						</p>
						<p className="mb-2 text-sm font-semibold text-white-mid">Current Price</p>
					</div>
					<div className="w-full flex justify-between items-center">
						<h5>{data.name}</h5>
						<h5>
							{data.currentPrice} {data.baseToken}
						</h5>
					</div>
				</div>
			</section>
			<section className="grid grid-rows-2 gap-5">
				<ul className="flex items-center gap-5">
					<LabelValue
						label="Start Time"
						value={moment(data.start.time)
							.utc()
							.format('MMM DD, YYYY H:mm A UTC')}
					/>
					<LabelValue label={'Start Price'} value={`${data.start.price} ${data.baseToken}`} />
					<LabelValue
						label={'Start Weight'}
						value={map(data.start.weight, (v, i) => `${v} ${data.poolTokens[i]}`).join(' : ')}
					/>
				</ul>
				<div className="flex items-center justify-between">
					<ul className="flex items-center gap-5">
						<LabelValue
							label="End Time"
							value={moment(data.end.time)
								.utc()
								.format('MMM DD, YYYY H:mm A UTC')}
						/>
						<LabelValue label={'Start Price'} value={`${data.end.price} ${data.baseToken}`} />
						<LabelValue
							label={'End Weight'}
							value={map(data.end.weight, (v, i) => `${v} ${data.poolTokens[i]}`).join(' : ')}
						/>
					</ul>
					<button
						onClick={() => history.push(`/bootstrap/${data.poolNum}`)}
						className="flex items-center hover:opacity-75 cursor-pointer">
						<p className="text-secondary-200">More Info</p>
						<Img src={'/public/assets/Icons/Right.svg'} />
					</button>
				</div>
			</section>
		</li>
	);
};

const LabelValue: FunctionComponent<{ label: string; value: string }> = ({ label, value }) => {
	return (
		<li>
			<p className="font-semibold text-white-mid">{label}</p>
			<p className="mt-0.75">{value}</p>
		</li>
	);
};
