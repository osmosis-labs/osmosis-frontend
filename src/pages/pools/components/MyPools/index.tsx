import { observer } from 'mobx-react-lite';
import React from 'react';
import { FullWidthContainer } from 'src/components/layouts/Containers';
import { TitleText } from 'src/components/Texts';
import { PoolCardList } from 'src/pages/pools/components/PoolCardList';
import { MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';
import { useStore } from 'src/stores';

export const MyPools = observer(function MyPools() {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const queryIncentivizedPools = queries.osmosis.queryIncentivizedPools;
	const myPools = queries.osmosis.queryGammPoolShare.getOwnPools(account.bech32Address);

	const myPoolInfoList = myPools
		.map(poolId => {
			// 이 카드는 보통 All Pools 카드와 함께 있다.
			// 따로 하나씩 pool을 쿼리하지 않고 All Pools의 페이지네이션 쿼리와 공유한다.
			const pool = queries.osmosis.queryGammPools.getPoolFromPagination(poolId);
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
				apr: queryIncentivizedPools.isIncentivized(pool.id)
					? queryIncentivizedPools.computeMostAPY(pool.id, priceStore, priceStore.getFiatCurrency('usd')!).toString()
					: undefined,
				liquidity: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				myLiquidity: tvl.mul(actualShareRatio).toString(),
				myLockedAmount: queryIncentivizedPools.isIncentivized(pool.id)
					? tvl.mul(actualLockedShareRatio).toString()
					: undefined,
				tokens: pool.poolAssets.map(asset => asset.amount.currency),
			} as MyPoolCardProp;
		})
		.filter((d): d is MyPoolCardProp => d != null);

	return (
		<FullWidthContainer>
			<TitleText>My Pools</TitleText>
			<PoolCardList poolList={myPoolInfoList} />
		</FullWidthContainer>
	);
});
