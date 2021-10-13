import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { CenterSelf } from 'src/components/layouts/Containers';
import { colorPrimaryDark, colorPrimaryDarker } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';
import { AssetBalancesList } from './AssetBalancesList';
import { AssetsOverview } from './AssetsOverview';
import { IbcTransferHistoryList } from './IbcTransferHistoryList';

export const AssetsPage: FunctionComponent = observer(() => {
	const { ibcTransferHistoryStore, chainStore, accountStore } = useStore();

	return (
		<AssetsPageContainer>
			<AssetsOverviewSection>
				<CenterSelf>
					<AssetsOverview title="My Osmosis Assets" />
				</CenterSelf>
			</AssetsOverviewSection>

			<BalanceAndHistorySection>
				<CenterSelf>
					<AssetBalancesList />
					{ibcTransferHistoryStore.getHistoriesAndUncommitedHistoriesByAccount(
						accountStore.getAccount(chainStore.current.chainId).bech32Address
					).length > 0 ? (
						<IbcTransferHistoryList />
					) : null}
				</CenterSelf>
			</BalanceAndHistorySection>
		</AssetsPageContainer>
	);
});

const AssetsPageContainer = styled.div`
	width: 100%;
	background-color: ${colorPrimaryDark};
	height: fit-content;
`;

const AssetsOverviewSection = styled.div`
	padding: 84px 20px 20px;
	background-color: ${colorPrimaryDarker};

	@media (min-width: 768px) {
		padding: 40px 60px;
	}
`;

const BalanceAndHistorySection = styled.div`
	padding: 20px 0;

	@media (min-width: 768px) {
		padding: 40px 60px;
	}
`;
