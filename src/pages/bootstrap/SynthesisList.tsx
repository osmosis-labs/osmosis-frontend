import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import cn from 'clsx';
import { MISC } from '../../constants';
import { useHistory } from 'react-router-dom';
import { useStore } from '../../stores';
import { CoinPretty, DecUtils } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { PromotedLBPPoolIds } from '../../config';

export const SynthesisList: FunctionComponent = () => {
	return (
		<ul>
			{PromotedLBPPoolIds.map((pool, index) => {
				return (
					<SynthesisItem
						key={pool.poolId}
						index={index}
						poolId={pool.poolId}
						name={pool.name}
						baseDenom={pool.baseDenom}
						destDenom={pool.destDenom}
					/>
				);
			})}
		</ul>
	);
};

const SynthesisItem: FunctionComponent<{
	index: number;
	poolId: string;
	name: string;
	baseDenom: string;
	destDenom: string;
}> = observer(({ index, poolId, name, baseDenom, destDenom }) => {
	const { chainStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const pool = queries.osmosis.queryGammPools.getPool(poolId);

	const history = useHistory();

	if (!pool || pool.smoothWeightChangeParams == null) {
		return <React.Fragment />;
	}

	const baseCurrency = chainStore.currentFluent.forceFindCurrency(baseDenom);

	return (
		<li
			className="w-full rounded-xl p-5 md:py-6 md:px-7.5 bg-card cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${poolId}`);
			}}>
			<section className="flex mb-5">
				<figure className="w-19 h-19 md:w-21 md:h-21 flex-shrink-0 mr-5 md:mr-7.5 rounded-full border border-enabledGold flex justify-center items-center">
					<figure
						className={cn(
							'w-16 h-16 md:w-18 md:h-18 flex-shrink-0 rounded-full flex justify-center items-end',
							MISC.GRADIENT_CLASS[index % MISC.GRADIENT_CLASS.length]
						)}>
						<img alt="bubbles" className="w-10 h-10 mb-1" src={'/public/assets/Icons/Bubbles.svg'} />
					</figure>
				</figure>
				<div className="flex flex-col md:flex-row justify-between md:items-center md:w-full">
					<div className="mr-2 flex flex-col mb-3 md:mb-0">
						<p className="mb-2 text-sm font-semibold text-white-mid">
							{pool.smoothWeightChangeParams.initialPoolWeights.map(w => w.currency.coinDenom.toUpperCase()).join('/')}{' '}
							(Pool-{pool.id})
						</p>
						<h5 className="text-lg md:text-xl">{name}</h5>
					</div>
					<div className="flex flex-col">
						<p className="mb-2 text-sm font-semibold text-white-mid">Current Price</p>
						<h5 className="text-lg md:text-xl">
							{priceStore
								.calculatePrice(new CoinPretty(baseCurrency, DecUtils.getPrecisionDec(baseCurrency.coinDecimals)))
								?.toString() ?? '$0'}
						</h5>
					</div>
				</div>
			</section>
			<section className="flex flex-col gap-5">
				<ul className="flex items-center gap-5 md:gap-10">
					<LabelValue
						label={'Start Weight'}
						value={pool.smoothWeightChangeParams.initialPoolWeights
							.map(
								w =>
									`${w.ratio
										.maxDecimals(2)
										.trim(true)
										.toString()} ${w.currency.coinDenom.toUpperCase()}`
							)
							.join(' : ')}
					/>
					<LabelValue
						label={'End Weight'}
						value={pool.smoothWeightChangeParams.targetPoolWeights
							.map(
								w =>
									`${w.ratio
										.maxDecimals(2)
										.trim(true)
										.toString()} ${w.currency.coinDenom.toUpperCase()}`
							)
							.join(' : ')}
					/>
				</ul>
				<ul className="flex items-center gap-5 md:gap-10">
					<LabelValue
						label="Start Time"
						value={
							dayjs(pool.smoothWeightChangeParams.startTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'
						}
					/>
					<LabelValue
						label="End Time"
						value={
							dayjs(pool.smoothWeightChangeParams.endTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'
						}
					/>
				</ul>
			</section>
		</li>
	);
});

const LabelValue: FunctionComponent<{ label: string; value: string }> = ({ label, value }) => {
	return (
		<li>
			<p className="font-semibold text-white-mid">{label}</p>
			<p className="mt-0.75">{value}</p>
		</li>
	);
};
