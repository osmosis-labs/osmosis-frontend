import React, { FunctionComponent } from 'react';
import cn from 'clsx';
import { Img } from '../../components/common/Img';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { TModal } from '../../interfaces';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';
import { CoinPretty, Dec, DecUtils } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { Loader } from '../../components/common/Loader';
import { QueriedPoolBase } from '../../stores/osmosis/query/pool';
import { OsmoSynthesis } from './OsmoSynthesis';

const bgArray = [
	'bg-gradients-socialLive',
	'bg-gradients-greenBeach',
	'bg-gradients-kashmir',
	'bg-gradients-frost',
	'bg-gradients-cherry',
	'bg-gradients-sunset',
];

export const PoolPage: FunctionComponent = observer(() => {
	const history = useHistory();
	const match = useRouteMatch<{
		id: string;
	}>();

	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const ref = React.useRef<QueriedPoolBase>();
	ref.current = queries.osmosis.queryGammPools.getPool(match.params.id);
	const pool = ref.current;

	// TODO: 아래 TODO가 되려면 pool값이 없을 떄 별도의 에러메시지가 필요할듯.
	// 현재로써는 짧은 시간을 기다려서 못찾았다고 표시하는 정도로 마무리 짓는 것 외엔 크게 방법이...
	// TODO: ObservableChainQuery의 근본적이 수정이 필요. swr의 구현 방식을 참고하면 될듯.
	React.useEffect(() => {
		// TODO : fix in the future
		setTimeout(() => {
			if (!ref.current) {
				history.push('/pools');
				// TODO : toast message saying 'that pool was not found'
			}
		}, 1500);
	}, [history]);

	// TODO: 선택된 id의 풀이 없을 때 처리
	console.log(ref.current);
	return (
		<div className="w-full h-full">
			{pool ? (
				<>
					<div className="my-10 max-w-max mx-auto px-10">
						<PoolInfoHeader id={pool.id} />
					</div>
					<div className="py-10 px-10 bg-surface w-full">
						<div className="pb-10">
							<OsmoSynthesis pool={pool} />
						</div>
						<div className="max-w-max mx-auto">
							<PoolCatalyst id={pool.id} />
						</div>
					</div>
				</>
			) : (
				<Loader className="w-50 h-50" />
			)}
		</div>
	);
});

const PoolInfoHeader: FunctionComponent<{
	id: string;
}> = observer(({ id }) => {
	const { chainStore, queriesStore, priceStore, accountStore, layoutStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pool = queries.osmosis.queryGammPools.getPool(id);

	const account = accountStore.getAccount(chainStore.current.chainId);
	const shareRatio = queries.osmosis.queryGammPoolShare.getGammShareRatio(account.bech32Address, id);

	// `shareRatio`가 백분률로 오기 때문에 10^2를 나눠줘야한다.
	const actualRatio = shareRatio.toDec().quo(DecUtils.getPrecisionDec(2));

	const onLiquidityClick = React.useCallback(() => {
		layoutStore.updateCurrentModal(TModal.MANAGE_LIQUIDITY);
	}, [layoutStore]);

	return (
		<>
			{pool ? (
				<section>
					<div className="flex items-center mb-6">
						<h5 className="mr-6">Lab #{id}</h5>
						<button
							onClick={onLiquidityClick}
							className="ml-6 bg-primary-200 rounded-lg px-3.75 py-2.5 cursor-pointer hover:opacity-75">
							<p>Add / Remove Liquidity</p>
						</button>
					</div>
					<div className="flex flex-row gap-20">
						<ul className="flex flex-col gap-6">
							<OverviewLabelValue label="Pool Liquidity">
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
		</>
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
