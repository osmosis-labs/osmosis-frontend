import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import times from 'lodash-es/times';
import map from 'lodash-es/map';
import { Img } from '../../components/common/Img';
import { multiply } from '../../utils/Big';
import { applyOptionalDecimal, formatUSD } from '../../utils/format';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

const defaultData = times(6, i => {
	return {
		num: i + 1,
		name: 'Lab',
		apy: 3.25,
		liquidity: '$343234',
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

const defaulMyData = times(3, i => {
	return {
		num: i + 1,
		name: 'Lab',
		apy: 3.25,
		liquidity: '$343234',
		tokens: ['atom', 'iris', 'scrt'],
	} as IPoolData;
});
export const MyPools: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const myPools = queries.osmosis.queryGammPoolShare.getOwnPools(account.bech32Address);

	const state: IPoolData[] = myPools
		.map(poolId => {
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (!pool) {
				return undefined;
			}

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				num: parseInt(pool.id),
				name: 'Lab',
				// TODO: APY는 TODO
				apy: 3.25,
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				tokens: pool.poolAssets.map(asset => asset.amount.currency.coinDenom),
			};
		})
		.filter(d => d != null) as IPoolData[];

	return (
		<section>
			<h5 className="mb-7.5 ">My Pools</h5>
			<ul className="grid grid-cols-3 gap-8.75 w-full h-full">
				{map(state, pool => {
					return <PoolCard key={pool.num} data={pool} />;
				})}
			</ul>
		</section>
	);
});

export const IncentivizedPools: FunctionComponent = () => {
	// TODO : @Thunnini fetch pools
	const [state, setState] = React.useState<IPoolData[]>(defaultData);

	return (
		<section>
			<h5 className="mb-7.5 ">Incentivized Pools</h5>
			<ul className="grid grid-cols-3 grid-rows-2 gap-8.75 w-full h-full">
				{map(state, pool => {
					return <PoolCard key={pool.num} data={pool} />;
				})}
			</ul>
		</section>
	);
};

const PoolCard: FunctionComponent<IPoolCard> = ({ data }) => {
	const history = useHistory();

	return (
		<li
			className="rounded-xl bg-card py-6 px-7.5 cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${data.num}`);
			}}>
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
				<div className="border-r border-enabledGold pr-5">
					<p className="text-sm text-white-mid mb-2">APY</p>
					<h6 className="text-white-emphasis">{applyOptionalDecimal(multiply(data.apy, 100, 2))}%</h6>
				</div>
				<div className="ml-5">
					<p className="text-sm text-white-mid mb-2">Liquidity</p>
					<h6 className="text-white-emphasis">{data.liquidity}</h6>
				</div>
			</section>
		</li>
	);
};
interface IPoolCard {
	data: IPoolData;
}

interface IPoolData {
	num: number;
	name: string;
	apy: number;
	liquidity: string;
	tokens: string[];
}
