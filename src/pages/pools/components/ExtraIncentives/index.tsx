import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { FullWidthContainer } from 'src/components/layouts/Containers';
import { TitleText } from 'src/components/Texts';
import { PoolCardList } from './pools';
import { useFilteredExtraIncentivePools } from 'src/pages/pools/components/ExtraIncentives/hook';

export const ExtraIncentivizedPools: FunctionComponent<{ filterByToken: string }> = observer(
	({ filterByToken }: { filterByToken: string }) => {
		const incentivizedPoolInfoList = useFilteredExtraIncentivePools({ filterByToken });

		return (
			<FullWidthContainer>
				<TitleText>External Incentive Pools</TitleText>

				{incentivizedPoolInfoList.length !== 0 ? <PoolCardList poolList={incentivizedPoolInfoList} /> : null}
			</FullWidthContainer>
		);
	}
);
