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
			<div className="flex items-center mb-6">
				<h4 className="mr-0.5">{title}</h4>
			</div>
			<div className="flex items-center gap-21.5">
				<OverviewLabelValue label="Active Pools">
					<h4 className="inline">{activePools.length}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Total Pools">
					<h4 className="inline">{poolIds.length}</h4>
				</OverviewLabelValue>
				<OverviewLabelValue label="Total Pool Value">
					<h4 className="inline">{totalPoolValue.toString()}</h4>
				</OverviewLabelValue>
			</div>
		</section>
	);
});
