import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterV, FullWidthContainer } from 'src/components/layouts/Containers';
import { HideCreateNewPool } from 'src/config';
import { CreateNewPoolDialog } from 'src/dialogs/create-new-pool';
import { OsmoPrice } from './OsmoPrice';
import { RewardPayoutCountdown } from './RewardPayoutCountdown';

export const LabsOverview = observer(function LabsOverview() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<FullWidthContainer>
			<CreateNewPoolDialog
				dialogStyle={{ minWidth: '656px' }}
				isOpen={isDialogOpen}
				close={() => setIsDialogOpen(false)}
			/>
			<OverviewTitle>
				<h5>Active Pools</h5>
				{!HideCreateNewPool && <CreateButton onClick={() => setIsDialogOpen(true)}>Create New Pool</CreateButton>}
			</OverviewTitle>

			<PriceWrapper as="ul">
				<OsmoPrice />
				<RewardPayoutCountdown />
				{/* <AllTVL /> */}
			</PriceWrapper>
		</FullWidthContainer>
	);
});

const OverviewTitle = styled(CenterV)`
	margin-bottom: 24px;
`;

const CreateButton = styled(ButtonPrimary)`
	margin-left: 28px;
`;

const PriceWrapper = styled(CenterV)`
	gap: 80px;
`;
