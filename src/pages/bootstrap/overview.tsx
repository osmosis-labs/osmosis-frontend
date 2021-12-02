import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { Dec } from '@keplr-wallet/unit';
import { OverviewLabelValue } from '../../components/common/OverviewLabelValue';

export const LBPOverview: FunctionComponent<{ title: string; poolIds: string[] }> = observer(({ title, poolIds }) => {
	const { chainStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const pools = poolIds.map(poolId => {
		return queries.osmosis.queryGammPools.getPool(poolId);
	});

	const activePools = pools.filter(pool => pool?.smoothWeightChangeParams != null);

	let totalPoolValue = new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(0));
	for (const pool of activePools) {
		if (pool) {
			const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
			totalPoolValue = totalPoolValue.add(tvl);
		}
	}

	return (
		<section className="w-full">
			<div className="flex items-center mb-4 md:mb-6">
				<h5 className="md:text-2xl text-xl leading-snug">{title}</h5>
			</div>
			<div className="flex flex-col md:flex-row md:gap-21.5">
				<div className="flex items-center gap-10 md:gap-21.5 mb-2.5 md:mb-0">
					<OverviewLabelValue label="Active Pools">
						<h5 className="inline md:text-2xl text-xl">{activePools.length}</h5>
					</OverviewLabelValue>
					<OverviewLabelValue label="Total Pools">
						<h5 className="inline md:text-2xl text-xl">{poolIds.length}</h5>
					</OverviewLabelValue>
				</div>
				<div>
					<OverviewLabelValue label="Total Pool Value">
						<h5 className="inline md:text-2xl text-xl">{totalPoolValue.toString()}</h5>
					</OverviewLabelValue>
				</div>
			</div>
		</section>
	);
});
