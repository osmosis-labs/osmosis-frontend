import styled from '@emotion/styled';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { onLgWidth, onMdWidth } from 'src/emotionStyles/mediaQueries';
import { PoolCardItem } from 'src/pages/pools/components/PoolCardList/PoolCardItem';
import { isMyPoolCardProp } from 'src/pages/pools/components/PoolCardList/utils/isMyPoolCardProp';
import { IncentivizedPoolCardProp, MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';

interface Props {
	poolList: Array<IncentivizedPoolCardProp | MyPoolCardProp>;
}

export function PoolCardList({ poolList }: Props) {
	const history = useHistory();
	return (
		<PoolCardListContainer>
			{poolList.map(pool => {
				return (
					<PoolCardItem
						onClick={e => {
							e.preventDefault();
							history.push(`/pool/${pool.poolId}`);
						}}
						key={pool.poolId}
						poolId={pool.poolId}
						apr={pool.apr}
						liquidity={pool.liquidity}
						tokens={pool.tokens}
						myLiquidity={isMyPoolCardProp(pool) ? pool.myLiquidity : undefined}
						myLockedAmount={isMyPoolCardProp(pool) ? pool.myLockedAmount : undefined}
					/>
				);
			})}
		</PoolCardListContainer>
	);
}

const PoolCardListContainer = styled.ul`
	display: grid;
	width: 100%;
	height: 100%;
	gap: 35px;
	grid-template-columns: repeat(1, minmax(0, 1fr));

	${onMdWidth} {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	${onLgWidth} {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
`;
