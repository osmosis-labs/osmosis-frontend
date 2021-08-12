import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { FromBox } from 'src/components/SwapToken/FromBox';
import { SwapDirectionButton } from 'src/components/SwapToken/SwapDirectionButton';
import { TitleText } from 'src/components/Texts';
import { wrapBaseDialog } from 'src/dialogs';
import { colorPrimary } from 'src/emotionStyles/colors';
import { useFakeFeeConfig } from 'src/hooks/tx';
import { ToBox } from 'src/pages/main/components/ToBox';
import { FeesBox } from 'src/pages/pool/components/PoolInfoHeader/FeesBox';
import { SwapButton } from 'src/pages/pool/components/PoolInfoHeader/SwapButton';
import { usePoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { useStore } from 'src/stores';

interface PoolSwapDialogProps {
	poolId: string;
	close: () => void;
}

export const PoolSwapDialog = wrapBaseDialog(
	observer(function PoolSwapDialog({ poolId, close }: PoolSwapDialogProps) {
		const { chainStore, queriesStore, accountStore } = useStore();

		const account = accountStore.getAccount(chainStore.current.chainId);
		const queries = queriesStore.get(chainStore.current.chainId);

		const config = usePoolSwapConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.queryBalances,
			poolId,
			queries.osmosis.queryGammPools
		);
		const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.swapExactAmountIn.gas);
		config.setFeeConfig(feeConfig);

		return (
			<PoolSwapDialogContainer>
				<TitleText pb={30}>Swap Tokens</TitleText>
				<PoolSwapDialogContent>
					<PairContainer>
						<div style={{ marginBottom: 18 }}>
							<FromBox config={config} dropdownStyle={{ marginLeft: -16, width: 500 + 16 + 20 }} />
						</div>
						<SwapDirectionButton
							onClick={e => {
								e.preventDefault();
								config.switchInAndOut();
							}}
						/>
						<div style={{ marginBottom: 18 }}>
							<ToBox config={config} dropdownStyle={{ marginLeft: -16, width: 500 + 16 + 20 }} />
						</div>
					</PairContainer>

					<FeesBox config={config} />

					<SwapButton config={config} close={close} />
				</PoolSwapDialogContent>
			</PoolSwapDialogContainer>
		);
	})
);

const PoolSwapDialogContainer = styled.section`
	width: 100%;
	margin-left: auto;
	margin-right: auto;
`;

const PoolSwapDialogContent = styled.div`
	border-radius: 0.75rem;
	background-color: ${colorPrimary};
	padding: 24px 30px;
`;

const PairContainer = styled.div`
	position: relative;
`;
