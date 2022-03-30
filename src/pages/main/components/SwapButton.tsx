import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import useWindowSize from 'src/hooks/useWindowSize';
import { ConnectAccountButton } from 'src/components/ConnectAccountButton';
import { CtaButton } from 'src/components/layouts/Buttons';
import { Spinner } from 'src/components/Spinners';
import { Text } from 'src/components/Texts';
import { colorError } from 'src/emotionStyles/colors';
import { useAccountConnection } from 'src/hooks/account/useAccountConnection';
import { TradeConfig } from 'src/pages/main/stores/trade/config';
import { useStore } from 'src/stores';

interface Props {
	config: TradeConfig;
}

const useVisibilitychangeVisible = (fn: () => void) => {
	const fnRef = useRef(fn);
	fnRef.current = fn;

	useEffect(() => {
		const handler = () => {
			if (document.visibilityState === 'visible') {
				fnRef.current();
			}
		};

		document.addEventListener('visibilitychange', handler);

		return () => {
			document.removeEventListener('visibilitychange', handler);
		};
	}, []);
};

export const SwapButton = observer(function SwapButton({ config }: Props) {
	const { chainStore, accountStore, queriesStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const { isAccountConnected, connectAccount } = useAccountConnection();

	const currentSwapPools = useMemo(() => {
		return config.optimizedRoutes?.swaps.map(swap => swap.poolId) ?? [];
	}, [config.optimizedRoutes]);

	const isSwapPoolsFetching =
		currentSwapPools.find(poolId => {
			return queries.osmosis.queryGammPools.getObservableQueryPool(poolId).isFetching;
		}) != null;

	const { isMobileView } = useWindowSize();

	useEffect(() => {
		currentSwapPools.forEach(poolId => {
			const pool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
			if (!pool.isFetching) {
				pool.fetch();
			}
		});
	}, []);

	useVisibilitychangeVisible(() => {
		currentSwapPools.forEach(poolId => {
			const pool = queries.osmosis.queryGammPools.getObservableQueryPool(poolId);
			if (!pool.isFetching) {
				pool.fetch();
			}
		});
	});

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

	const handleSwapButtonClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
						{
							amount: [
								{
									denom: chainStore.current.stakeCurrency.coinMinimalDenom,
									amount: '0',
								},
							],
						},
						{
							preferNoSetFee: true,
						},
						tx => {
							if (!tx.code) {
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
						{
							amount: [
								{
									denom: chainStore.current.stakeCurrency.coinMinimalDenom,
									amount: '0',
								},
							],
						},
						{
							preferNoSetFee: true,
						},
						tx => {
							if (!tx.code) {
								config.setAmount('');
							}
						}
					);
				}
			} catch (e) {
				console.log(e);
			}
		}
	};

	return (
		<CtaButton
			onClick={handleSwapButtonClick}
			style={config.showWarningOfSlippage ? { backgroundColor: colorError } : undefined}
			disabled={!account.isReadyToSendMsgs || config.poolIds.length === 0 || config.getError() != null}>
			{account.isSendingMsg === 'swapExactAmountIn' ? (
				<Spinner />
			) : (
				<Text emphasis="high" isMobileView={isMobileView} style={{ letterSpacing: '0.025em' }}>
					{isSwapPoolsFetching && <Spinner style={{ marginRight: 12, display: 'inline-block' }} />}
					{config.showWarningOfSlippage ? 'Swap Anyway' : 'Swap'}
				</Text>
			)}
		</CtaButton>
	);
});
