import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { CenterSelf } from 'src/components/layouts/Containers';
import { colorPrimaryDark, colorPrimaryDarker } from 'src/emotionStyles/colors';
import { useStore } from 'src/stores';
import { AssetBalancesList } from './AssetBalancesList';
import { AssetsOverview } from './AssetsOverview';
import { IbcTransferHistoryList } from './IbcTransferHistoryList';
import { UnpoolingTable } from 'src/pages/pool/components/LiquidityMining/UnpoolingTable';

export const AssetsPage: FunctionComponent = observer(() => {
	const { ibcTransferHistoryStore, chainStore, queriesStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);

	const showUnpoolingTable = (() => {
		// If has unlocking tokens except gamm lp share.
		const accountLockedResponse = queries.osmosis.queryAccountLocked.get(account.bech32Address).response;
		if (!accountLockedResponse) {
			return false;
		}

		for (const lock of accountLockedResponse.data.locks) {
			for (const coin of lock.coins) {
				if (!coin.denom.startsWith('gamm/pool/')) {
					return true;
				}
			}
		}

		return false;
	})();

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

			{showUnpoolingTable ? (
				<UnpoolingTableSection>
					<CenterSelf>
						<UnpoolingTableContainer>
							<UnpoolingTable />
						</UnpoolingTableContainer>
					</CenterSelf>
				</UnpoolingTableSection>
			) : null}
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

const UnpoolingTableContainer = styled.div`
	width: 100%;
	background-color: ${colorPrimaryDark};
	height: fit-content;
`;

const UnpoolingTableSection = styled.div`
	padding: 20px 0;

	@media (min-width: 768px) {
		padding: 40px 60px;
	}
`;
