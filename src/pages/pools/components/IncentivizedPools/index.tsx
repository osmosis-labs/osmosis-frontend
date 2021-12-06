import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { FullWidthContainer } from 'src/components/layouts/Containers';
import { TitleText, Text } from 'src/components/Texts';
import { PoolCardList } from 'src/pages/pools/components/PoolCardList';
import { IncentivizedPoolCardProp } from 'src/pages/pools/models/poolCardProps';
import { useStore } from 'src/stores';

export const IncentivizedPools: FunctionComponent = observer(() => {
	const { chainStore, queriesStore, priceStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const queryIncentivizedPools = queries.osmosis.queryIncentivizedPools;

	const incentivizedPoolInfoList = queryIncentivizedPools.incentivizedPools
		.map(poolId => {
			// 이 카드는 보통 All Pools 카드와 함께 있다.
			// 따로 하나씩 pool을 쿼리하지 않고 All Pools의 페이지네이션 쿼리와 공유한다.
			const pool = queries.osmosis.queryGammPools.getPoolFromPagination(poolId);
			if (!pool) {
				return undefined;
			}

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId: pool.id,
				apr: {
					value: queryIncentivizedPools.isIncentivized(pool.id)
						? queryIncentivizedPools.computeMostAPY(pool.id, priceStore, priceStore.getFiatCurrency('usd')!).toString()
						: undefined,
					isLoading: queryIncentivizedPools.isAprFetching,
				},
				liquidity: {
					value: pool.computeTotalValueLocked(priceStore, priceStore.getFiatCurrency('usd')!).toString(),
				},
				tokens: pool.poolAssets.map(asset => asset.amount.currency),
			} as IncentivizedPoolCardProp;
		})
		.filter((d): d is IncentivizedPoolCardProp => d != null);

	return (
		<FullWidthContainer>
			<TitleText>Incentivized Pools</TitleText>

			{incentivizedPoolInfoList.length === 0 ? (
				<NoActiveCard>
					<Text size="lg" emphasis="high" pb={20}>
						No active liquidity incentives
					</Text>
					<Text weight="medium">
						Liquidity mining will begin once the first update pool incentives governance proposal passes.
					</Text>
				</NoActiveCard>
			) : null}

			<PoolCardList poolList={incentivizedPoolInfoList} />
		</FullWidthContainer>
	);
});

const NoActiveCard = styled.div`
	width: 100%;
	border-radius: 0.75rem;
	background-color: rgba(45, 39, 85, 1);
	padding-top: 32px;
	padding-bottom: 32px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;
