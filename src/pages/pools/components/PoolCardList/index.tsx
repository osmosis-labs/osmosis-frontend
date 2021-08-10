import React from 'react';
import { useHistory } from 'react-router-dom';
import { PoolCardListGridContainer } from 'src/components/layouts/Containers';
import { PoolCardItem } from 'src/pages/pools/components/PoolCardList/PoolCardItem';
import { isMyPoolCardProp } from 'src/pages/pools/components/PoolCardList/utils/isMyPoolCardProp';
import { IncentivizedPoolCardProp, MyPoolCardProp } from 'src/pages/pools/models/poolCardProps';

interface Props {
	poolList: Array<IncentivizedPoolCardProp | MyPoolCardProp>;
}

export function PoolCardList({ poolList }: Props) {
	const history = useHistory();
	return (
		<PoolCardListGridContainer>
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
		</PoolCardListGridContainer>
	);
}
