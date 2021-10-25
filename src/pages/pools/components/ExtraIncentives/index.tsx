import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { FullWidthContainer } from 'src/components/layouts/Containers';
import { TitleText } from 'src/components/Texts';
import { PoolCardList } from './pools';
import { useStore } from 'src/stores';
import { ExtraGaugeInPool } from 'src/config';

export const ExtraIncentivizedPools: FunctionComponent = observer(() => {
	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);

	const incentivizedPoolInfoList = Object.keys(ExtraGaugeInPool)
		.filter(poolId => {
			const inner = ExtraGaugeInPool[poolId];
			const data = Array.isArray(inner) ? inner : [inner];

			if (data.length === 0) {
				return false;
			}

			return queries.osmosis.queryGammPools.getPoolFromPagination(poolId);
		})
		.map(poolId => {
			const inner = ExtraGaugeInPool[poolId];
			const data = Array.isArray(inner) ? inner : [inner];

			const pool = queries.osmosis.queryGammPools.getPoolFromPagination(poolId);

			// 데이터 구조를 바꿀 필요가 있다.
			return {
				poolId,
				currencies: pool!.poolAssets.map(asset => asset.amount.currency),
				gaugeIds: data.map(d => d.gaugeId),
				// Assume that the incentive denom should be same.
				incentiveDenom: data[0].denom,
			};
		});

	return (
		<FullWidthContainer>
			<TitleText>External Incentive Pools</TitleText>

			{incentivizedPoolInfoList.length !== 0 ? <PoolCardList poolList={incentivizedPoolInfoList} /> : null}
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
