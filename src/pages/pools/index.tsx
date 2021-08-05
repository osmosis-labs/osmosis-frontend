import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CenterSection } from 'src/components/layouts/Containers';
import { IncentivizedPools } from 'src/pages/pools/components/IncentivizedPools';
import { MyPools } from 'src/pages/pools/components/MyPools';
import { AllPools } from './components/AllPools';
import { LabsOverview } from './components/LabsOverview';

export const PoolsPage = observer(function PoolsPage() {
	return (
		<PageContainer>
			<OverviewSection>
				<LabsOverview />
			</OverviewSection>

			<MyPoolsSection>
				<MyPools />
			</MyPoolsSection>

			<PoolsSection>
				<IncentivizedPools />
			</PoolsSection>

			<PoolsSection>
				<AllPools />
			</PoolsSection>
		</PageContainer>
	);
});

const PageContainer = styled.div`
	width: 100%;
	height: 100%;
`;

const OverviewSection = styled(CenterSection)`
	background: url('/public/assets/backgrounds/osmosis-pool-machine.png') no-repeat;
	background-size: contain;
	background-position-x: right;
`;

const MyPoolsSection = styled(CenterSection)`
	background-color: #1c173c;
`;

const PoolsSection = styled(CenterSection)`
	background-color: rgba(35, 29, 75, 1);
`;
