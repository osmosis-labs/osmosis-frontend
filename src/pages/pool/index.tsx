import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Loader } from 'src/components/common/Loader';
import { CenterSelf, FullScreenContainer } from 'src/components/layouts/Containers';
import { LockupAbledPoolIds } from 'src/config';
import { colorPrimaryDark } from 'src/emotionStyles/colors';
import { PoolCatalyst } from 'src/pages/pool/components/PoolCatalyst';
import { PoolInfoHeader } from 'src/pages/pool/components/PoolInfoHeader';
import { useStore } from 'src/stores';
import { QueriedPoolBase } from 'src/stores/osmosis/query/pool';
import { LbpCatalyst } from './components/LbpCatalyst';
import { LiquidityMining } from './components/LiquidityMining';

interface QueryParams {
	/**pool id*/
	id: string;
}

export const PoolPage: FunctionComponent = observer(() => {
	const history = useHistory();
	const match = useRouteMatch<QueryParams>();

	const { chainStore, queriesStore } = useStore();

	const queries = queriesStore.get(chainStore.current.chainId);
	const observablePool = queries.osmosis.queryGammPools.getObservableQueryPool(match.params.id);
	const pool = observablePool.pool;

	useEffect(() => {
		if (!observablePool.isFetching && !observablePool.pool) {
			// Invalid request.
			history.push('/pools');
		}
	}, [history, observablePool.isFetching, observablePool.pool]);

	if (!pool) {
		return (
			<FullScreenContainer>
				<LoaderStyled />
			</FullScreenContainer>
		);
	}

	return (
		<FullScreenContainer>
			<PoolInfoHeaderSection>
				<PoolInfoHeaderWrapper>
					<CenterSelf>
						<PoolInfoHeader poolId={pool.id} />
					</CenterSelf>
				</PoolInfoHeaderWrapper>

				<PoolInfoHeaderBgWrapper>
					<PoolInfoHeaderBg isLbp={isLbp(pool.smoothWeightChangeParams)} />
				</PoolInfoHeaderBgWrapper>
			</PoolInfoHeaderSection>

			<LiquidityMiningSection>
				{/* 인센티브를 받을 수 있는 풀 또는 config에서 설정된 풀의 경우만 Synthesis를 표시한다. */}
				{(queries.osmosis.queryIncentivizedPools.isIncentivized(pool.id) || LockupAbledPoolIds[pool.id]) && (
					<div style={{ paddingBottom: 60 }}>
						<LiquidityMining poolId={pool.id} />
					</div>
				)}
				{isLbp(pool.smoothWeightChangeParams) && <LbpCatalyst pool={pool} lbpParams={pool.smoothWeightChangeParams} />}
			</LiquidityMiningSection>

			<PoolCatalystSection>
				<CenterSelf>
					<PoolCatalyst poolId={pool.id} />
				</CenterSelf>
			</PoolCatalystSection>
		</FullScreenContainer>
	);
});

const LiquidityMiningSection = styled.div`
	background-color: ${colorPrimaryDark};
	width: 100%;
	padding: 40px 40px 0;
`;

const PoolCatalystSection = styled.div`
	background-color: ${colorPrimaryDark};
	width: 100%;
	padding: 0 40px 40px;
`;

const PoolInfoHeaderSection = styled.div`
	position: relative;
`;

const LoaderStyled = styled(Loader)`
	width: 12.5rem;
	height: 12.5rem;
`;

const PoolInfoHeaderWrapper = styled.div`
	padding: 40px;
	width: 100%;
	position: relative;
	z-index: 10;
`;

const PoolInfoHeaderBgWrapper = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	overflow: hidden;
	width: 100%;
	height: 100%;
	z-index: 0;
`;

const PoolInfoHeaderBg = styled.div<{ isLbp: boolean }>`
	position: absolute;
	height: 100%;
	${({ isLbp }) => ({
		right: isLbp ? '0' : '3rem',
		width: isLbp ? '900px' : '600px',
		background: isLbp
			? 'url("/public/assets/backgrounds/pool-details-lbp.png")'
			: 'url("/public/assets/backgrounds/osmosis-guy-in-lab.png")',
		backgroundPositionX: isLbp ? 'right' : undefined,
	})}
	background-size: contain;
	background-repeat: no-repeat;
`;

function isLbp(
	smoothWeightChangeParams: QueriedPoolBase['smoothWeightChangeParams']
): smoothWeightChangeParams is NonNullable<QueriedPoolBase['smoothWeightChangeParams']> {
	return smoothWeightChangeParams != null;
}
