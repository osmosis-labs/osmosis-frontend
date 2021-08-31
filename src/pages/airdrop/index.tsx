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
					<AirdropMissions style={{ marginTop: 48 }} />
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
	margin: 40px 60px;
`;

const ProgressSection = styled.div`
	margin-top: 36px;
	padding: 50px 60px;
	background-color: ${colorPrimaryDark};
`;
