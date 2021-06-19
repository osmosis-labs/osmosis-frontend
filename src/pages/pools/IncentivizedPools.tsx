import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Img } from '../../components/common/Img';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { AppCurrency } from '@keplr-wallet/types';
import { Dec } from '@keplr-wallet/unit';

const bgArray = [
	'bg-gradients-socialLive',
	'bg-gradients-greenBeach',
	'bg-gradients-kashmir',
	'bg-gradients-frost',
	'bg-gradients-cherry',
	'bg-gradients-sunset',
];

export const MyPools: FunctionComponent = observer(() => {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const queryIncentivizedPools = queries.osmosis.queryIncentivizedPools;
	const myPools = queries.osmosis.queryGammPoolShare.getOwnPools(account.bech32Address);

	const state = myPools
		.map(poolId => {
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (!pool) {
				return undefined;
			}

			const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
			const shareRatio = queries.osmosis.queryGammPoolShare.getAllGammShareRatio(account.bech32Address, pool.id);
			const actualShareRatio = shareRatio.increasePrecision(2);

			const lockedShareRatio = queries.osmosis.queryGammPoolShare.getLockedGammShareRatio(
				account.bech32Address,
				pool.id
			);
			const actualLockedShareRatio = lockedShareRatio.increasePrecision(2);

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId: pool.id,
				apy: queryIncentivizedPools.isIncentivized(pool.id)
					? queryIncentivizedPools.computeMostAPY(pool.id, priceStore, priceStore.getFiatCurrency('usd')!).toString()
					: undefined,
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				myLiquidity: tvl.mul(actualShareRatio).toString(),
				myLockedAmount: queryIncentivizedPools.isIncentivized(pool.id)
					? tvl.mul(actualLockedShareRatio).toString()
					: undefined,
				tokens: pool.poolAssets.map(asset => asset.amount.currency),
			};
		})
		.filter(d => d != null) as MyPoolCardProps[];

	return (
		<section>
			<h5 className="mb-7.5 ">My Pools</h5>
			<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8.75 w-full h-full">
				{state.map(pool => {
					return (
						<MyPoolCard
							key={pool.poolId}
							poolId={pool.poolId}
							apy={pool.apy}
							liquidity={pool.liquidity}
							myLiquidity={pool.myLiquidity}
							myLockedAmount={pool.myLockedAmount}
							tokens={pool.tokens}
						/>
					);
				})}
			</ul>
		</section>
	);
});

export const IncentivizedPools: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const queryIncentivizedPools = queries.osmosis.queryIncentivizedPools;

	const state = queryIncentivizedPools.incentivizedPools
		.map(poolId => {
			const pool = queries.osmosis.queryGammPools.getPool(poolId);
			if (!pool) {
				return undefined;
			}

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId: pool.id,
				apy: queryIncentivizedPools.computeMostAPY(pool.id, priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				tokens: pool.poolAssets.map(asset => asset.amount.currency),
			};
		})
		.filter(d => d != null) as PoolCardProps[];

	return (
		<section>
			<h5 className="mb-7.5 ">Incentivized Pools</h5>
			{state.length === 0 ? (
				<div className="w-full rounded-xl bg-card py-8 flex flex-col items-center">
					<h6 className="mb-5 font-normal">No active liquidity incentives</h6>
					<p className="text-white-mid font-medium">
						Liquidity mining will begin once the first update pool incentives governance proposal passes.
					</p>
				</div>
			) : null}
			<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8.75 w-full h-full">
				{state.map(pool => {
					return (
						<PoolCard
							key={pool.poolId}
							poolId={pool.poolId}
							apy={pool.apy}
							liquidity={pool.liquidity}
							tokens={pool.tokens}
						/>
					);
				})}
			</ul>
		</section>
	);
});

interface MyPoolCardProps {
	poolId: string;
	apy?: string;
	liquidity: string;
	myLiquidity: string;
	myLockedAmount?: string;
	tokens: AppCurrency[];
}

const MyPoolCard: FunctionComponent<MyPoolCardProps> = ({
	poolId,
	apy,
	liquidity,
	myLiquidity,
	myLockedAmount,
	tokens,
}) => {
	const history = useHistory();

	return (
		<li
			className="rounded-xl bg-card py-6 px-7.5 cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${poolId}`);
			}}>
			<section className="flex mb-4">
				<figure
					style={{ width: '84px', height: '84px' }}
					className="rounded-full border border-enabledGold flex justify-center items-center mr-6">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-center',
							bgArray[(parseInt(poolId) - 1) % bgArray.length]
						)}>
						<Img className="w-10 h-10" src={'/public/assets/Icons/OSMO.svg'} />
					</figure>
				</figure>
				<div className="mt-3.75">
					<h5>Pool #{poolId}</h5>
					<p className="text-sm text-white-mid font-semibold mt-2">
						{tokens
							.map(token => {
								// IBC Currency라도 원래의 coin denom을 보여준다.
								const displayDenom = (() => {
									if ('originCurrency' in token && token.originCurrency) {
										return token.originCurrency.coinDenom.toUpperCase();
									}

									return token.coinDenom.toUpperCase();
								})();

								return displayDenom;
							})
							.join('/')}
					</p>
				</div>
			</section>
			<section className="flex items-center">
				<div>
					<p className="text-sm text-white-mid mb-2">Pool Liquidity</p>
					<h6 className="text-white-emphasis">{liquidity}</h6>
				</div>
				{apy ? (
					<div className="ml-5">
						<p className="text-sm text-white-mid mb-2">APY</p>
						<h6 className="text-white-emphasis">{apy}%</h6>
					</div>
				) : null}
			</section>
			<div
				className="border-b border-enabledGold my-4"
				style={{
					maxWidth: apy || myLockedAmount ? '15.5rem' : '6.5rem',
				}}
			/>
			<section className="flex items-center">
				<div>
					<p className="text-sm text-white-mid mb-2">My Liquidity</p>
					<h6 className="text-white-emphasis">{myLiquidity}</h6>
				</div>
				{myLockedAmount ? (
					<div className="ml-5">
						<p className="text-sm text-white-mid mb-2">My Bonded Amount</p>
						<h6 className="text-white-emphasis">{myLockedAmount}</h6>
					</div>
				) : null}
			</section>
		</li>
	);
};

interface PoolCardProps {
	poolId: string;
	apy: string;
	liquidity: string;
	tokens: AppCurrency[];
}

const PoolCard: FunctionComponent<PoolCardProps> = ({ poolId, apy, liquidity, tokens }) => {
	const history = useHistory();

	return (
		<li
			className="rounded-xl bg-card py-6 px-7.5 cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${poolId}`);
			}}>
			<section className="flex mb-4">
				<figure
					style={{ width: '84px', height: '84px' }}
					className="rounded-full border border-enabledGold flex justify-center items-center mr-6">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-center',
							bgArray[(parseInt(poolId) - 1) % bgArray.length]
						)}>
						<Img className="w-10 h-10" src={'/public/assets/Icons/OSMO.svg'} />
					</figure>
				</figure>
				<div className="mt-3.75">
					<h5>Pool #{poolId}</h5>
					<p className="text-sm text-white-mid font-semibold mt-2">
						{tokens
							.map(token => {
								// IBC Currency라도 원래의 coin denom을 보여준다.
								const displayDenom = (() => {
									if ('originCurrency' in token && token.originCurrency) {
										return token.originCurrency.coinDenom.toUpperCase();
									}

									return token.coinDenom.toUpperCase();
								})();

								return displayDenom;
							})
							.join('/')}
					</p>
				</div>
			</section>
			<section className="flex items-center">
				<div className="border-r border-enabledGold pr-5">
					<p className="text-sm text-white-mid mb-2">APY</p>
					<h6 className="text-white-emphasis">{apy}%</h6>
				</div>
				<div className="ml-5">
					<p className="text-sm text-white-mid mb-2">Pool Liquidity</p>
					<h6 className="text-white-emphasis">{liquidity}</h6>
				</div>
			</section>
		</li>
	);
};
