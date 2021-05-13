import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import map from 'lodash-es/map';
import { Img } from '../../components/common/Img';
import { multiply } from '../../utils/Big';
import { applyOptionalDecimal } from '../../utils/format';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

const bgArray = [
	'bg-gradients-socialLive',
	'bg-gradients-greenBeach',
	'bg-gradients-kashmir',
	'bg-gradients-frost',
	'bg-gradients-cherry',
	'bg-gradients-sunset',
];

export interface PoolData {
	poolId: string;
	apy: string;
	liquidity: string;
	tokens: string[];
}

export const MyPools: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const queryPoolIncentives = queries.osmosis.queryPoolIncentives;
	const myPools = queries.osmosis.queryGammPoolShare.getOwnPools(account.bech32Address);

	const state = myPools
		.map(poolId => {
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (!pool) {
				return undefined;
			}

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId: pool.id,
				apy: queryPoolIncentives.computeAPY(pool.id).toString(),
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				tokens: pool.poolAssets.map(asset => asset.amount.currency.coinDenom),
			};
		})
		.filter(d => d != null) as PoolData[];

	return (
		<section>
			<h5 className="mb-7.5 ">My Pools</h5>
			<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8.75 w-full h-full">
				{state.map(pool => {
					return <PoolCard key={pool.poolId} data={pool} />;
				})}
			</ul>
		</section>
	);
});

export const IncentivizedPools: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const queryPoolIncentives = queries.osmosis.queryPoolIncentives;

	const state = queryPoolIncentives
		.getIncentivizedPools()
		.map(poolId => {
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (!pool) {
				return undefined;
			}

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId: pool.id,
				apy: queryPoolIncentives.computeAPY(pool.id).toString(),
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				tokens: pool.poolAssets.map(asset => asset.amount.currency.coinDenom),
			};
		})
		.filter(d => d != null) as PoolData[];

	return (
		<section>
			<h5 className="mb-7.5 ">Incentivized Pools</h5>
			<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8.75 w-full h-full">
				{state.map(pool => {
					return <PoolCard key={pool.poolId} data={pool} />;
				})}
			</ul>
		</section>
	);
});

const PoolCard: FunctionComponent<{
	data: PoolData;
}> = ({ data }) => {
	const history = useHistory();

	return (
		<li
			className="rounded-xl bg-card py-6 px-7.5 cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${data.poolId}`);
			}}>
			<section className="flex mb-4">
				<figure
					style={{ width: '84px', height: '84px' }}
					className="rounded-full border border-enabledGold flex justify-center items-center mr-6">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-center',
							bgArray[(parseInt(data.poolId) - 1) % bgArray.length]
						)}>
						<Img className="w-10 h-10" src={'/public/assets/Icons/OSMO.svg'} />
					</figure>
				</figure>
				<div className="mt-3.75">
					<h5>Lab #{data.poolId}</h5>
					<p className="text-sm text-white-mid font-semibold mt-2">
						{data.tokens
							.map(token => {
								return token.toUpperCase();
							})
							.join('/')}
					</p>
				</div>
			</section>
			<section className="flex items-center">
				<div className="border-r border-enabledGold pr-5">
					<p className="text-sm text-white-mid mb-2">APY</p>
					<h6 className="text-white-emphasis">{data.apy}%</h6>
				</div>
				<div className="ml-5">
					<p className="text-sm text-white-mid mb-2">Liquidity</p>
					<h6 className="text-white-emphasis">{data.liquidity}</h6>
				</div>
			</section>
		</li>
	);
};
