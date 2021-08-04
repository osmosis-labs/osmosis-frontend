import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CenterSection } from '../../components/layouts/Containers';
import { AllPools } from './AllPools';
import { IncentivizedPools, MyPools } from './IncentivizedPools';
import { LabsOverview } from './LabsOverview';

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
