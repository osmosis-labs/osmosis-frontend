import { Dec, IntPretty } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { ConnectAccountButton } from 'src/components/ConnectAccountButton';
import { CtaButton } from 'src/components/layouts/Buttons';
import { Spinner } from 'src/components/Spinners';
import { Text } from 'src/components/Texts';
import { useAccountConnection } from 'src/hooks/account/useAccountConnection';
import { PoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { useStore } from 'src/stores';

interface SwapButtonProps {
	config: PoolSwapConfig;
	close: () => void;
}

export const SwapButton = observer(function SwapButton({ config, close }: SwapButtonProps) {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	const { isAccountConnected, connectAccount } = useAccountConnection();

	const handleSwapButtonClicked = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();

		let slippage = config.estimatedSlippage.mul(new Dec('1.05'));
		if (slippage.toDec().lt(new Dec(1))) {
			slippage = new IntPretty(new Dec(1));
		}

		if (account.isReadyToSendMsgs) {
			const poolId = config.poolId;
			if (!poolId) {
				throw new Error("Can't calculate the optimized pools");
			}

			try {
				await account.osmosis.sendSwapExactAmountInMsg(
					poolId,
					{
						currency: config.sendCurrency,
						amount: config.amount,
					},
					config.outCurrency,
					slippage
						.locale(false)
						.maxDecimals(18)
						.toString(),
					'',
					tx => {
						if (!tx.code) {
							config.setAmount('');
							close();
						}
					}
				);
			} catch (e) {
				console.log(e);
			}
		}
	};

	if (!isAccountConnected) {
		return (
			<ConnectAccountButton
				onClick={e => {
					e.preventDefault();
					connectAccount();
				}}
			/>
		);
	}

	return (
		<CtaButton onClick={handleSwapButtonClicked} disabled={!account.isReadyToSendMsgs || config.getError() != null}>
			{account.isSendingMsg === 'swapExactAmountIn' ? (
				<Spinner />
			) : (
				<Text emphasis="high" style={{ letterSpacing: '0.025em' }}>
					Swap
				</Text>
			)}
		</CtaButton>
	);
});
