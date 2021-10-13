import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { CenterSelf } from 'src/components/layouts/Containers';
import { colorPrimaryDark } from 'src/emotionStyles/colors';
import { AirdropMissions } from './AirdropMissions';
import { AirdropOverview } from './AirdropOverview';
import { MyAirdropProgress } from './MyAirdropProgress';

export const AirdropPage: FunctionComponent = () => {
	return (
		<AirdropPageContainer>
			<AirdropOverviewSection>
				<CenterSelf>
					<AirdropOverview />
				</CenterSelf>
			</AirdropOverviewSection>

			<ProgressSection>
				<CenterSelf>
					<MyAirdropProgress />
					<AirdropMissions />
				</CenterSelf>
			</ProgressSection>
		</AirdropPageContainer>
	);
};

const AirdropPageContainer = styled.div`
	width: 100%;
	height: 100%;
`;

const AirdropOverviewSection = styled.div`
	padding: 84px 20px 20px;

	@media (min-width: 768px) {
		padding: 40px 60px;
	}
`;

const ProgressSection = styled.div`
	padding: 20px;
	background-color: ${colorPrimaryDark};

	@media (min-width: 768px) {
		padding: 50px 60px;
	}
`;
