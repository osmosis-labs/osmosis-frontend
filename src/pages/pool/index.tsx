import React, { FunctionComponent, useEffect, useState } from 'react';
import cn from 'clsx';
import { Img } from '../../components/common/Img';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { Dec, DecUtils } from '@keplr-wallet/unit';
import { Loader } from '../../components/common/Loader';
import { OsmoSynthesis } from './OsmoSynthesis';
import { ManageLiquidityDialog } from '../../dialogs';
import { MISC } from '../../constants';
import { LBPCatalyst } from './LBP';
import { PoolSwapDialog } from './PoolSwap';
import { HideAddLiquidityPoolIds } from '../../config';

export const PoolPage: FunctionComponent = observer(() => {
	const history = useHistory();
	const match = useRouteMatch<{
		id: string;
	}>();

	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const observablePool = queries.osmosis.queryGammPools.getObservableQueryPool(match.params.id);
	const pool = observablePool.pool;

	useEffect(() => {
		if (!observablePool.isFetching && !observablePool.pool) {
			// Invalid request.
			history.push('/pools');
		}
	}, [observablePool.isFetching, observablePool.pool]);

	return (
		<div className="w-full h-full">
			{pool ? (
				<React.Fragment>
					<div className="relative">
						<div className="py-10 w-full px-10 relative z-10">
							<div className="max-w-max mx-auto">
								<PoolInfoHeader id={pool.id} />
							</div>
						</div>
						<div className="absolute right-0 top-0 overflow-hidden w-full h-full z-0">
							<div
								className="absolute"
								style={{
									right: pool.smoothWeightChangeParams ? '0' : '3rem',
									height: '100%',
									width: pool.smoothWeightChangeParams ? '900px' : '600px',
									background: pool.smoothWeightChangeParams
										? 'url("/public/assets/backgrounds/pool-details-lbp.png")'
										: 'url("/public/assets/backgrounds/osmosis-guy-in-lab.png")',
									backgroundSize: 'contain',
									backgroundRepeat: 'no-repeat',
									backgroundPositionX: pool.smoothWeightChangeParams ? 'right' : undefined,
								}}
							/>
						</div>
					</div>
					<div className="py-10 w-full px-10 bg-surface">
						{/* 인센티브를 받을 수 있는 풀의 경우만 Synthesis를 표시한다. */}
						{queries.osmosis.queryIncentivizedPools.isIncentivized(pool.id) ? (
							<div className="pb-15">
								<OsmoSynthesis poolId={pool.id} />
							</div>
						) : null}
						{pool.smoothWeightChangeParams ? (
							<LBPCatalyst pool={pool} lbpParams={pool.smoothWeightChangeParams} />
						) : null}
						<div className="max-w-max mx-auto">
							<PoolCatalyst id={pool.id} />
						</div>
					</div>
				</React.Fragment>
			) : (
				<Loader className="w-50 h-50" />
			)}
		</div>
	);
});

const PoolInfoHeader: FunctionComponent<{
	id: string;
}> = observer(({ id }) => {
	const { chainStore, queriesStore, priceStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(id);

	const account = accountStore.getAccount(chainStore.current.chainId);
	const shareRatio = queries.osmosis.queryGammPoolShare.getAllGammShareRatio(account.bech32Address, id);

	const locked = queries.osmosis.queryGammPoolShare
		.getLockedGammShare(account.bech32Address, id)
		.add(queries.osmosis.queryGammPoolShare.getUnlockableGammShare(account.bech32Address, id));
	const actualLockedRatio = pool ? locked.quo(pool.totalShare) : new Dec(0);

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const closeDialog = () => setIsDialogOpen(false);

	const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
	const closeSwapDialog = () => setIsSwapDialogOpen(false);

	return (
		<React.Fragment>
			{pool ? (
				<section>
					<ManageLiquidityDialog
						dialogStyle={{ width: '656px', minHeight: '533px' }}
						poolId={id}
						isOpen={isDialogOpen}
						close={closeDialog}
					/>
					<PoolSwapDialog poolId={pool.id} isOpen={isSwapDialogOpen} close={closeSwapDialog} />
					<div className="flex items-center mb-6">
						<h5 className="mr-6">Pool #{id}</h5>
						{!HideAddLiquidityPoolIds[pool.id] ? (
							<button
								onClick={e => {
									e.preventDefault();

									setIsDialogOpen(true);
								}}
								className="ml-6 bg-primary-200 rounded-lg px-3.75 py-2.5 cursor-pointer hover:opacity-75">
								<p>Add / Remove Liquidity</p>
							</button>
						) : null}
						<button
							onClick={e => {
								e.preventDefault();

								setIsSwapDialogOpen(true);
							}}
							className="ml-6 bg-primary-200 rounded-lg px-3.75 py-2.5 cursor-pointer hover:opacity-75">
							<p>Swap Tokens</p>
						</button>
					</div>
					<div className="flex gap-20">
						<ul className="flex flex-col gap-6">
							<OverviewLabelValue label="Pool Liquidity">
								<h4>{pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString()}</h4>
							</OverviewLabelValue>
							<OverviewLabelValue label="Bonded">
								<h6>
									{pool
										.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!)
										.mul(actualLockedRatio)
										.toString()}
								</h6>
							</OverviewLabelValue>
						</ul>
						<ul className="flex flex-col gap-6">
							<OverviewLabelValue label="My Liquidity">
								<h4>
									{(() => {
										const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);

										return tvl.mul(actualRatio).toString();
									})()}
								</h4>
							</OverviewLabelValue>
							<OverviewLabelValue label="Swap Fee">
								<h6>{pool.swapFee.toString()}%</h6>
							</OverviewLabelValue>
						</ul>
						{pool.exitFee.toDec().equals(new Dec(0)) ? null : (
							<ul className="flex flex-col gap-6">
								<OverviewLabelValue label="&#8203;">
									<h4>&#8203;</h4>
								</OverviewLabelValue>
								<OverviewLabelValue label="Exit Fee">
									<h6>{pool.exitFee.toString()}%</h6>
								</OverviewLabelValue>
							</ul>
						)}
					</div>
				</section>
			) : null}
		</React.Fragment>
	);
});

const PoolCatalyst: FunctionComponent<{
	id: string;
}> = observer(({ id }) => {
	const { chainStore, queriesStore, accountStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(id);

	const account = accountStore.getAccount(chainStore.current.chainId);
	// ShareRatio가 백분률로 온다는 것을 주의하자.
	const shareRatio = queries.osmosis.queryGammPoolShare.getAllGammShareRatio(account.bech32Address, id);

	return (
		<React.Fragment>
			{pool ? (
				<section className="pb-10 max-w-max mx-auto">
					<h5 className="mb-7.5 ">Pool Catalyst</h5>
					<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8.75 w-full h-full">
						{/* TODO: IntPretty에 mul과 quo도 추가하자... */}
						{pool.poolRatios.map((poolRatio, i) => {
							return (
								<PoolAssetCard
									key={poolRatio.amount.currency.coinMinimalDenom}
									index={i}
									ratio={poolRatio.ratio.toString()}
									denom={poolRatio.amount.currency.coinDenom}
									totalAmount={poolRatio.amount
										.trim(true)
										.shrink(true)
										.toString()}
									myAmount={poolRatio.amount
										.mul(shareRatio.increasePrecision(2))
										.trim(true)
										.shrink(true)
										.toString()}
								/>
							);
						})}
					</ul>
				</section>
			) : null}
		</React.Fragment>
	);
});

const PoolAssetCard: FunctionComponent<{
	index: number;
	ratio: string;
	denom: string;
	totalAmount: string;
	myAmount: string;
}> = ({ index, ratio, denom, totalAmount, myAmount }) => {
	return (
		<li className="rounded-xl bg-card py-6 px-7.5">
			<section className="flex mb-4">
				<figure
					style={{ width: '84px', height: '84px' }}
					className="rounded-full border border-enabledGold flex justify-center items-center mr-6">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-end',
							MISC.GRADIENT_CLASS[index % MISC.GRADIENT_CLASS.length]
						)}>
						<Img className="w-10 h-10 mb-1" src={'/public/assets/Icons/Bubbles.svg'} />
					</figure>
				</figure>
				<div className="flex flex-col justify-center">
					<h4>{ratio}%</h4>
					<p className="text-sm text-white-mid font-semibold mt-2">{denom}</p>
				</div>
			</section>
			<section className="flex flex-col">
				<div className="mb-2">
					<p className="text-sm text-white-mid font-semibold mb-2">Total amount</p>
					<h6>{totalAmount}</h6>
				</div>
				<div>
					<p className="text-sm text-white-mid font-semibold mb-2">My amount</p>
					<h6>{myAmount}</h6>
				</div>
			</section>
		</li>
	);
};
