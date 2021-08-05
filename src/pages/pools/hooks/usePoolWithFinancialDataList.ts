import { Dec } from '@keplr-wallet/unit';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { useMemo } from 'react';
import { usePoolFinancialData } from 'src/hooks/pools/usePoolFinancialData';
import { useStore } from 'src/stores';

export function usePoolWithFinancialDataList() {
	const { chainStore, queriesStore, priceStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);

	const pools = queries.osmosis.queryGammPools.getPoolsDescendingOrderTVL(
		priceStore,
		priceStore.getFiatCurrency('usd')!
	);
	const poolFinancialDataByPoolId = usePoolFinancialData();

	return useMemo(() => {
		return pools.map(pool => {
			const volume24hRaw = poolFinancialDataByPoolId.data?.[pool.id]?.[0]?.volume_24h;
			/**
			 * Sometimes, the volume24h has the decimals greater than 18.
			 * In this case, the `Dec` type can't handle such big decimals.
			 * So, must truncate the decimals with `toFixed()` method.
			 * */
			const volume24h =
				volume24hRaw != null
					? new PricePretty(priceStore.getFiatCurrency('usd')!, new Dec(volume24hRaw.toFixed(10))).toString()
					: '...';
			const tvl = pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!);
			const swapFee = `${pool.swapFee.toString()}%`;
			return { pool, volume24h, tvl, swapFee };
		});
	}, [pools, poolFinancialDataByPoolId.data, priceStore]);
}
