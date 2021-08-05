import { observer } from 'mobx-react-lite';
import React from 'react';
import { OverviewLabelValue } from 'src/components/common/OverviewLabelValue';
import { useStore } from 'src/stores';

export const AllTvl = observer(function AllTvl() {
	const { chainStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	return (
		<OverviewLabelValue label="Total Liquidity">
			<h4>
				{queries.osmosis.queryGammPools
					.computeAllTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!)
					.toString()}
			</h4>
		</OverviewLabelValue>
	);
});
