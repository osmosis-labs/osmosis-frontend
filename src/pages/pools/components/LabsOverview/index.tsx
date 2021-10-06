import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonPrimary } from 'src/components/layouts/Buttons';
import { CenterV, FullWidthContainer } from 'src/components/layouts/Containers';
import { HideCreateNewPool } from 'src/config';
import { CreateNewPoolDialog } from 'src/dialogs/create-new-pool';
import { OsmoPrice } from './OsmoPrice';
import { RewardPayoutCountdown } from './RewardPayoutCountdown';
import useWindowSize from 'src/hooks/useWindowSize';

export const LabsOverview = observer(function LabsOverview() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { isMobileView } = useWindowSize();

	return (
		<FullWidthContainer>
			<CreateNewPoolDialog
				dialogStyle={{ minWidth: '656px' }}
				isOpen={isDialogOpen}
				close={() => setIsDialogOpen(false)}
			/>
			<OverviewTitle>
				<h5 className="flex-shrink-0">Active Pools</h5>
				{!HideCreateNewPool && !isMobileView && (
					<CreateButton onClick={() => setIsDialogOpen(true)}>Create New Pool</CreateButton>
				)}
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
	margin-bottom: 16px;

	@media (min-width: 768px) {
		margin-bottom: 24px;
	}
`;

const CreateButton = styled(ButtonPrimary)`
	margin-left: 24px;

	@media (min-width: 768px) {
		margin-left: 28px;
	}
`;

const PriceWrapper = styled(CenterV)`
	gap: 40px;

	@media (min-width: 768px) {
		gap: 80px;
	}
`;
