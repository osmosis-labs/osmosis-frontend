import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import cn from 'clsx';
import { MISC } from '../../constants';
import { Img } from '../../components/common/Img';
import { useHistory } from 'react-router-dom';
import { useStore } from '../../stores';
import { CoinPretty, Dec, DecUtils, IntPretty } from '@keplr-wallet/unit';
import dayjs from 'dayjs';
import { PromotedLBPPoolIds } from '../../config';
import { calcSpotPrice } from '../../stores/osmosis/pool/math';
import { toJS } from 'mobx';

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

	const initialSpotPrice: Dec = (() => {
		if (!pool.smoothWeightChangeParams) {
			return new Dec(0);
		}

		const baseAsset = pool.poolAssets.find(asset => asset.amount.currency.coinMinimalDenom === baseDenom);
		const baseWeight = pool.smoothWeightChangeParams.initialPoolWeights.find(
			w => w.currency.coinMinimalDenom === baseDenom
		);
		const destAsset = pool.poolAssets.find(asset => asset.amount.currency.coinMinimalDenom === destDenom);
		const destWeight = pool.smoothWeightChangeParams.initialPoolWeights.find(
			w => w.currency.coinMinimalDenom === destDenom
		);
		if (!baseAsset || !baseWeight || !destAsset || !destWeight) {
			return new Dec(0);
		}

		return calcSpotPrice(
			destAsset.amount.toDec(),
			destWeight.weight.toDec(),
			baseAsset.amount.toDec(),
			baseWeight.weight.toDec(),
			new Dec(0)
		);
	})();

	const targetSpotPrice: Dec = (() => {
		if (!pool.smoothWeightChangeParams) {
			return new Dec(0);
		}

		const baseAsset = pool.poolAssets.find(asset => asset.amount.currency.coinMinimalDenom === baseDenom);
		const baseWeight = pool.smoothWeightChangeParams.targetPoolWeights.find(
			w => w.currency.coinMinimalDenom === baseDenom
		);
		const destAsset = pool.poolAssets.find(asset => asset.amount.currency.coinMinimalDenom === destDenom);
		const destWeight = pool.smoothWeightChangeParams.targetPoolWeights.find(
			w => w.currency.coinMinimalDenom === destDenom
		);
		if (!baseAsset || !baseWeight || !destAsset || !destWeight) {
			return new Dec(0);
		}

		return calcSpotPrice(
			destAsset.amount.toDec(),
			destWeight.weight.toDec(),
			baseAsset.amount.toDec(),
			baseWeight.weight.toDec(),
			new Dec(0)
		);
	})();

	const baseCurrency = chainStore.currentFluent.forceFindCurrency(baseDenom);
	const destCurrency = chainStore.currentFluent.forceFindCurrency(destDenom);

	return (
		<li
			className="w-full rounded-2xl p-7.5 bg-card mb-7.5 cursor-pointer border border-transparent hover:border-enabledGold border-opacity-40"
			onClick={e => {
				e.preventDefault();

				history.push(`/pool/${poolId}`);
			}}>
			<section className="flex mb-5">
				<figure
					style={{ minWidth: '84px', minHeight: '84px' }}
					className="mr-7.5 rounded-full border border-enabledGold flex justify-center items-center">
					<figure
						className={cn(
							'w-18 h-18 rounded-full flex justify-center items-end',
							MISC.GRADIENT_CLASS[index % MISC.GRADIENT_CLASS.length]
						)}>
						<Img className="w-10 h-10 mb-1" src={'/public/assets/Icons/Bubbles.svg'} />
					</figure>
				</figure>
				<div style={{ height: '84px' }} className="w-full flex flex-col justify-center items-start">
					<div
						className="w-full flex justify-between items-center mb-1"
						style={{
							marginTop: '-4px',
						}}>
						<p className="text-sm font-semibold text-white-mid">
							{pool.smoothWeightChangeParams.initialPoolWeights.map(w => w.currency.coinDenom.toUpperCase()).join('/')}{' '}
							(Pool-{pool.id})
						</p>
						<p className="mb-2 text-sm font-semibold text-white-mid">Current Price</p>
					</div>
					<div className="w-full flex justify-between items-center">
						<h5>{name}</h5>
						<h5>
							{priceStore
								.calculatePrice(
									'usd',
									new CoinPretty(baseCurrency, DecUtils.getPrecisionDec(baseCurrency.coinDecimals))
								)
								?.toString() ?? '$0'}
						</h5>
					</div>
				</div>
			</section>
			<section className="grid grid-rows-2 gap-5">
				<ul className="flex items-center gap-5">
					<LabelValue
						label="Start Time"
						value={
							dayjs(pool.smoothWeightChangeParams.startTime)
								.utc()
								.format('MMMM D, YYYY h:mm A') + ' UTC'
						}
					/>
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
				</ul>
				<div className="flex items-center justify-between">
					<ul className="flex items-center gap-5">
						<LabelValue
							label="End Time"
							value={
								dayjs(pool.smoothWeightChangeParams.endTime)
									.utc()
									.format('MMMM D, YYYY h:mm A') + ' UTC'
							}
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
				</div>
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
