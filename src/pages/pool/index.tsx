import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Img } from '../../components/common/Img';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useRouteMatch } from 'react-router-dom';
import { TModal } from '../../interfaces';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { CoinPretty, Dec, DecUtils } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';

const bgArray = [
	'bg-gradients-socialLive',
	'bg-gradients-greenBeach',
	'bg-gradients-kashmir',
	'bg-gradients-frost',
	'bg-gradients-cherry',
	'bg-gradients-sunset',
];

export const PoolPage: FunctionComponent = observer(() => {
	const match = useRouteMatch<{
		id: string;
	}>();

	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(match.params.id);

	// TODO: 선택된 id의 풀이 없을 때 처리
	return (
		<div className="w-full h-full">
			<div className="my-10 max-w-max mx-auto">
				<div>{pool ? <PoolInfoHeader id={pool.id} /> : null}</div>
			</div>
			<div className="py-10 px-10 bg-surface w-full">
				<div className="max-w-max mx-auto">{pool ? <PoolCatalyst id={pool.id} /> : null}</div>
			</div>
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
	const shareRatio = queries.osmosis.queryGammPoolShare.getGammShareRatio(account.bech32Address, id);

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	return (
		<React.Fragment>
			{pool ? (
				<section className="w-full">
					<div className="flex items-center mb-6">
						<h5 className="mr-0.5">Lab #{id}</h5>
					</div>
					<div className="flex flex-row gap-20">
						<ul className="flex flex-col gap-6">
							<OverviewLabelValue label="Liquidity">
								<h4>{pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString()}</h4>
							</OverviewLabelValue>
							<OverviewLabelValue label="Locked">
								<h6>TODO</h6>
							</OverviewLabelValue>
						</ul>
						<ul className="flex flex-col gap-6">
							<OverviewLabelValue label="My Liquidity">
								<h4>
									{(() => {
										const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);

										// TODO: PricePretty에 mul과 quo도 추가하자...
										return new PricePretty(tvl.fiatCurrency, tvl.toDec().mul(actualRatio)).toString();
									})()}
								</h4>
							</OverviewLabelValue>
							<OverviewLabelValue label="Swap Fee">
								<h6>{pool.swapFee.toString()}%</h6>
							</OverviewLabelValue>
						</ul>
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
	const shareRatio = queries.osmosis.queryGammPoolShare.getGammShareRatio(account.bech32Address, id);

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	return (
		<React.Fragment>
			{pool ? (
				<section>
					<h5 className="mb-7.5 ">Pool Catalyst</h5>
					{/* TODO: 6개가 넘어갔을 때 어떡하지...? */}
					<ul className="grid grid-cols-3 grid-rows-2 gap-8.75 w-full h-full">
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
									myAmount={new CoinPretty(
										poolRatio.amount.currency,
										poolRatio.amount
											.toDec()
											.mul(actualRatio)
											.mul(DecUtils.getPrecisionDec(poolRatio.amount.currency.coinDecimals))
											.truncate()
									)
										.maxDecimals(2)
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
					<figure className={cn('w-18 h-18 rounded-full flex justify-center items-center', bgArray[index])}>
						<Img className="w-10 h-10" src={'/public/assets/Icons/OSMO.svg'} />
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
