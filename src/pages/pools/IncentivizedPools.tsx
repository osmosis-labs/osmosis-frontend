import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import map from 'lodash-es/map';
import { Img } from '../../components/common/Img';
import { multiply } from '../../utils/Big';
import { applyOptionalDecimal, formatUSD } from '../../utils/format';

const defaultData = times(6, i => {
	return {
		num: i + 1,
		name: 'Lab',
		apy: 3.25,
		liquidity: 343234.53,
		tokens: ['atom', 'iris', 'scrt'],
	} as IPoolData;
});

const bgArray = [
	'bg-gradients-socialLive',
	'bg-gradients-greenBeach',
	'bg-gradients-kashmir',
	'bg-gradients-frost',
	'bg-gradients-cherry',
	'bg-gradients-sunset',
];

export const IncentivizedPools: FunctionComponent = () => {
	const [state, setState] = React.useState<IPoolData[]>(defaultData);
	const [selected, setSelected] = React.useState<number>();
	return (
		<section>
			<h5 className="mb-7.5 ">Incentivized Pools</h5>
			<ul className="grid grid-cols-3 grid-rows-2 gap-8.75 w-full h-full">
				{map(state, (pool, cnt) => {
					return (
						<PoolCard key={pool.num} data={pool} selected={cnt === selected} setSelected={() => setSelected(cnt)} />
					);
				})}
			</ul>
		</section>
	);
};

const PoolCard: FunctionComponent<IPoolCard> = ({ data, selected, setSelected }) => {
	return (
		<li
			onClick={setSelected}
			className={cn('rounded-xl bg-card py-6 px-7.5 border border-transparent', {
				'border border-enabledGold border-opacity-40': selected,
			})}>
			<section className="flex mb-4">
				<figure
					style={{ width: '84px', height: '84px' }}
					className="rounded-full border border-enabledGold flex justify-center items-center mr-6">
					<figure className={cn('w-18 h-18 rounded-full flex justify-center items-center', bgArray[data.num - 1])}>
						<Img className="w-10 h-10" src={'/public/assets/Icons/OSMO.svg'} />
					</figure>
				</figure>
				<div className="mt-3.75">
					<h5>
						{data.name} #{data.num}
					</h5>
					<p className="text-sm text-white-mid font-semibold mt-2">
						{map(data.tokens, v => v.toUpperCase()).join(' / ')}
					</p>
				</div>
			</section>
			<section className="flex items-center">
				<div className="border-r border-enabledGold pr-10">
					<p className="text-sm text-white-mid mb-2">APY</p>
					<h6>{applyOptionalDecimal(multiply(data.apy, 100, 2))}%</h6>
				</div>
				<div className="ml-8 relative">
					<figure className="bg-primary-50 w-10 h-10 rounded-full border border-white-faint" />
					<figure
						style={{ left: '27px' }}
						className="bg-primary-100 w-10 h-10 rounded-full absolute top-0 border border-white-faint"
					/>
					<figure
						style={{ left: '54px' }}
						className="bg-primary-200 w-10 h-10 rounded-full absolute top-0 border border-white-faint"
					/>
				</div>
			</section>
			<section className="mt-4">
				<p className="text-sm text-white-mid mb-2">Liquidity</p>
				<h6>{formatUSD(data.liquidity)}</h6>
			</section>
		</li>
	);
};
interface IPoolCard {
	data: IPoolData;
	selected: boolean;
	setSelected: () => void;
}

interface IPoolData {
	num: number;
	name: string;
	apy: number;
	liquidity: number;
	tokens: string[];
}
