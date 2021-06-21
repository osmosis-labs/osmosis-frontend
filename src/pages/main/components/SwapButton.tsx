import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { TToastType, useToast } from '../../../components/common/toasts';
import { ConnectAccountButton } from '../../../components/ConnectAccountButton';
import { useAccountConnection } from '../../../hooks/account/useAccountConnection';
import { useStore } from '../../../stores';
import { isSlippageError } from '../../../utils/tx';
import { TradeConfig } from '../stores/trade/config';

interface Props {
	config: TradeConfig;
}

export const SwapButton = observer(({ config }: Props) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const { isAccountConnected, connectAccount } = useAccountConnection();

	const toast = useToast();

	if (!isAccountConnected) {
		return (
			<ConnectAccountButton
				className="h-15"
				onClick={e => {
					e.preventDefault();
					connectAccount();
				}}
			/>
		);
	}

	return (
		<button
			onClick={async e => {
				e.preventDefault();

				const optimizedRoutes = config.optimizedRoutes;
				if (account.isReadyToSendMsgs && optimizedRoutes) {
					const poolIds = config.poolIds;
					if (poolIds.length === 0) {
						throw new Error("Can't calculate the optimized pools");
					}

					try {
						if (optimizedRoutes.multihop) {
							await account.osmosis.sendMultihopSwapExactAmountInMsg(
								optimizedRoutes.swaps.map(route => {
									return {
										poolId: route.poolId,
										tokenOutCurrency: route.outCurrency,
									};
								}),
								{
									currency: config.sendCurrency,
									amount: config.amount,
								},
								config.slippage,
								'',
								tx => {
									if (tx.code) {
										toast.displayToast(TToastType.TX_FAILED, {
											message: isSlippageError(tx)
												? 'Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage.'
												: tx.log,
										});
									} else {
										toast.displayToast(TToastType.TX_SUCCESSFULL, {
											customLink: chainStore.current.explorerUrlToTx!.replace('{txHash}', tx.hash),
										});

										config.setAmount('');
									}
								}
							);
						} else {
							// Currently, optimized routes not supported.
							// Only return one pool that has lowest spot price.
							await account.osmosis.sendSwapExactAmountInMsg(
								optimizedRoutes.swaps[0].poolId,
								{
									currency: config.sendCurrency,
									amount: config.amount,
								},
								config.outCurrency,
								config.slippage,
								'',
								tx => {
									if (tx.code) {
										toast.displayToast(TToastType.TX_FAILED, {
											message: isSlippageError(tx)
												? 'Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage.'
												: tx.log,
										});
									} else {
										toast.displayToast(TToastType.TX_SUCCESSFULL, {
											customLink: chainStore.current.explorerUrlToTx!.replace('{txHash}', tx.hash),
										});

										config.setAmount('');
									}
								}
							);
						}
						toast.displayToast(TToastType.TX_BROADCASTING);
					} catch (e) {
						toast.displayToast(TToastType.TX_FAILED, { message: e.message });
					}
				}
			}}
			className={cn(
				'bg-primary-200 h-15 flex justify-center items-center w-full rounded-lg shadow-elevation-04dp hover:opacity-75 disabled:opacity-50',
				{
					'bg-missionError': config.showWarningOfSlippage,
				}
			)}
			disabled={!account.isReadyToSendMsgs || config.poolIds.length === 0 || config.getError() != null}>
			{account.isSendingMsg === 'swapExactAmountIn' ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
					viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
					<path
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						className="opacity-75"
					/>
				</svg>
			) : (
				<p className="font-body tracking-wide">{config.showWarningOfSlippage ? 'Swap Anyway' : 'Swap'}</p>
			)}
		</button>
	);
});
