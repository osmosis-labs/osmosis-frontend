import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { FromBox } from 'src/components/SwapToken/FromBox';
import { SwapDirectionButton } from 'src/components/SwapToken/SwapDirectionButton';
import { TitleText } from 'src/components/Texts';
import { wrapBaseDialog } from 'src/dialogs';
import { colorPrimary } from 'src/emotionStyles/colors';
import { useFakeFeeConfig } from 'src/hooks/tx';
import { ToBox } from 'src/components/SwapToken/ToBox';
import { FeesBox } from 'src/components/SwapToken/FeesBox';
import { SwapButton } from 'src/pages/pool/components/PoolInfoHeader/SwapButton';
import { PoolSwapConfig, usePoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { useStore } from 'src/stores';
import useWindowSize from 'src/hooks/useWindowSize';

interface PoolSwapDialogProps {
	poolId: string;
	close: () => void;
}

export const PoolSwapDialog = wrapBaseDialog(
	observer(function PoolSwapDialog({ poolId, close }: PoolSwapDialogProps) {
		const { chainStore, queriesStore, accountStore } = useStore();
		const { isMobileView } = useWindowSize();

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
				<TitleText isMobileView={isMobileView} pb={isMobileView ? 16 : 30}>
					Swap Tokens
				</TitleText>
				<PoolSwapClipboardContent config={config} />
			</PoolSwapDialogContainer>
		);
	})
);

export const PoolSwapClipboardContent: FunctionComponent<{
	config: PoolSwapConfig;
}> = observer(({ config }) => {
	const { isMobileView } = useWindowSize();

	return (
		<PoolSwapDialogContent>
			<PairContainer>
				<div>
					<FromBox config={config} dropdownStyle={isMobileView ? { width: 'calc(100vw - 72px)' } : {}} />
				</div>
				<SwapDirectionButton
					onClick={e => {
						e.preventDefault();
						config.switchInAndOut();
					}}
				/>
				<div className="mt-3 md:mt-4.5">
					<ToBox config={config} dropdownStyle={isMobileView ? { width: 'calc(100vw - 72px)' } : {}} />
				</div>
			</PairContainer>

			<div className="mt-3 md:mt-4.5">
				<FeesBox config={config} />
			</div>

			<SwapButton config={config} close={close} />
		</PoolSwapDialogContent>
	);
});

const PoolSwapDialogContainer = styled.section`
	width: 100%;
	margin-left: auto;
	margin-right: auto;
`;

const PoolSwapDialogContent = styled.div`
	@media (min-width: 768px) {
		border-radius: 0.75rem;
		background-color: ${colorPrimary};
		padding: 24px 30px;
	}
`;

const PairContainer = styled.div`
	position: relative;
`;
