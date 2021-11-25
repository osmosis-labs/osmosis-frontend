import { TxChainSetter } from '@keplr-wallet/hooks';
import { ChainGetter, ObservableQueryBalances } from '@keplr-wallet/stores';
import { Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, DecUtils, Int, IntPretty } from '@keplr-wallet/unit';
import cn from 'clsx';
import { findIndex } from 'lodash-es';
import { action, computed, makeObservable, observable, override } from 'mobx';
import { observer } from 'mobx-react-lite';
import { computedFn } from 'mobx-utils';
import React, { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react';
import InputSlider from 'react-input-slider';
import { AmountInput } from '../components/form/Inputs';
import { ProcessTracker } from '../components/common/ProcessTracker';
import { MISC } from '../constants';
import { OSMO_MEDIUM_TX_FEE } from '../constants/fee';
import { BasicAmountConfig, useBasicAmountConfig } from '../hooks/tx/basic-amount-config';
import { useStore } from '../stores';
import { ObservableQueryGammPoolShare } from '../stores/osmosis/query/pool-share';
import { ObservableQueryPools } from '../stores/osmosis/query/pools';
import { wrapBaseDialog } from './base';
import useWindowSize from 'src/hooks/useWindowSize';
import { PoolSwapConfig, usePoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { useFakeFeeConfig } from 'src/hooks/tx';
import { FromBox } from 'src/components/SwapToken/FromBox';
import { AddLiquidityConfig, LockupItem } from '.';
import { Process, useProcess } from 'src/hooks/process';
import { AccountWithCosmosAndOsmosis } from 'src/stores/osmosis/account';
import { Loader } from 'src/components/common/Loader';

export const AutoBondDialog = wrapBaseDialog(
	observer(({ poolId, close }: { poolId: string; close: () => void }) => {
		const process = useProcess();
		const { chainStore, queriesStore, accountStore } = useStore();

		const queries = queriesStore.get(chainStore.current.chainId);
		const account = accountStore.getAccount(chainStore.current.chainId);

		// Swap config
		const swapForLiquidityConfig = usePoolSwapConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.queryBalances,
			poolId,
			queries.osmosis.queryGammPools
		);
		const feeConfig = useFakeFeeConfig(chainStore, chainStore.current.chainId, account.msgOpts.swapExactAmountIn.gas);
		swapForLiquidityConfig.setFeeConfig(feeConfig);

		// Auto swap currency & amount
		const [didAutoCalc, reset] = useAutoCalc(swapForLiquidityConfig);

		// Join pool Config
		const [addLiquidityConfig] = useState(
			() =>
				new AddLiquidityConfig(
					chainStore,
					chainStore.current.chainId,
					poolId,
					account.bech32Address,
					queries.osmosis.queryGammPoolShare,
					queries.osmosis.queryGammPools,
					queries.queryBalances
				)
		);
		addLiquidityConfig.setChain(chainStore.current.chainId);
		addLiquidityConfig.setPoolId(poolId);
		addLiquidityConfig.setQueryPoolShare(queries.osmosis.queryGammPoolShare);
		addLiquidityConfig.setQueryPools(queries.osmosis.queryGammPools);
		addLiquidityConfig.setQueryBalances(queries.queryBalances);
		addLiquidityConfig.setSender(account.bech32Address);

		// Lock LP token config
		const [selectedDurationIndex, setSelectedDurationIndex] = useState(0);
		const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;
		const amountConfig = useBasicAmountConfig(
			chainStore,
			chainStore.current.chainId,
			account.bech32Address,
			queries.osmosis.queryGammPoolShare.getShareCurrency(poolId),
			queries.queryBalances
		);

		const error = swapForLiquidityConfig.getError();
		return (
			<div className="text-white-high w-full h-full">
				<h5 className="text-lg md:text-xl mb-5 md:mb-9">AutoBond</h5>
				<div className="flex justify-center">
					<div className="bg-card rounded-2xl p-6 max-w-max">
						{!process.active && !process.steps.length ? (
							<>
								<SwapForLiquidity config={swapForLiquidityConfig} />
								<LockupSelect {...{ poolId, selectedDurationIndex, setSelectedDurationIndex }} />
								<BottomButton
									swapForLiquidityConfig={swapForLiquidityConfig}
									addLiquidityConfig={addLiquidityConfig}
									startProcess={() => {
										if (process.active) return;
										console.log('AutoBond process start', { ready: account.isReadyToSendMsgs, error });
										if (!account.isReadyToSendMsgs || error != null) return;
										performProcess(
											account,
											process,
											swapForLiquidityConfig,
											addLiquidityConfig,
											amountConfig,
											lockableDurations[selectedDurationIndex]
										).catch((err: Error) => console.error('AutoBond process error', err));
									}}
									error={error}
								/>
							</>
						) : (
							<>
								<div className="flex flex-col items-center">
									{process.active ? (
										<img
											alt="logo"
											className={cn('s-spin', 'w-5 h-5 md:w-10 md:h-10 mb-4')}
											src={'/public/assets/main/logo-single.png'}
										/>
									) : null}
									<ProcessTracker process={process} />
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		);
	})
);

const SwapForLiquidity: FunctionComponent<{
	config: PoolSwapConfig;
}> = observer(({ config }) => {
	const { isMobileView } = useWindowSize();

	return (
		<React.Fragment>
			<p style={{ marginBottom: isMobileView ? 12 : 18 }}>
				1. Swap {config.sendCurrency.coinDenom} to {config.outCurrency.coinDenom}
				<br />
				<span className="text-sm">Auto-calculated to go all-in on both sides</span>
			</p>
			<div style={{ marginBottom: isMobileView ? 12 : 18 }}>
				<FromBox config={config} dropdownStyle={isMobileView ? { width: 'calc(100vw - 72px)' } : {}} />
			</div>
		</React.Fragment>
	);
});

const LockupSelect: FunctionComponent<{
	poolId: string;
	selectedDurationIndex: number;
	setSelectedDurationIndex: React.Dispatch<React.SetStateAction<number>>;
}> = observer(({ poolId, selectedDurationIndex, setSelectedDurationIndex }) => {
	const { isMobileView } = useWindowSize();
	const { chainStore, queriesStore, accountStore, priceStore } = useStore();
	const queries = queriesStore.get(chainStore.current.chainId);
	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	return (
		<>
			<p style={{ marginBottom: isMobileView ? 12 : 18 }}>2. Select Lockup period</p>
			<ul className="flex flex-col gap-2.5 mb-5 md:flex-row md:gap-9 md:mb-6">
				{lockableDurations.map((duration, i) => {
					return (
						<LockupItem
							key={i.toString()}
							duration={duration.humanize()}
							setSelected={() => {
								setSelectedDurationIndex(i);
							}}
							selected={i === selectedDurationIndex}
							apy={`${queries.osmosis.queryIncentivizedPools
								.computeAPY(poolId, duration, priceStore, priceStore.getFiatCurrency('usd')!)
								.toString()}%`}
						/>
					);
				})}
			</ul>
		</>
	);
});

const BottomButton: FunctionComponent<{
	swapForLiquidityConfig: PoolSwapConfig;
	addLiquidityConfig: AddLiquidityConfig;
	startProcess: () => void;
	error: Error | undefined;
}> = observer(({ swapForLiquidityConfig, addLiquidityConfig, startProcess, error }) => {
	const { chainStore, accountStore } = useStore();
	const account = accountStore.getAccount(chainStore.current.chainId);

	return (
		<React.Fragment>
			{error && (
				<div className="mb-3.5 md:mt-6 md:mb-7.5 w-full flex justify-center items-center">
					<div className="py-1.5 px-2.5 md:px-3.5 rounded-lg bg-missionError flex justify-center items-center">
						<img className="h-5 w-5 mr-2.5" src="/public/assets/Icons/Info-Circle.svg" />
						<p>{error.message}</p>
					</div>
				</div>
			)}
			<div className="mt-8 w-full flex items-center justify-center">
				<button
					disabled={!account.isReadyToSendMsgs || error != null}
					className="w-full md:w-2/3 h-12 md:h-15 bg-primary-200 rounded-xl md:rounded-2xl flex justify-center items-center hover:opacity-75 cursor-pointer disabled:opacity-50"
					onClick={async e => {
						e.preventDefault();
						startProcess();
					}}>
					<p className="text-white-high font-semibold text-base md:text-lg">AutoBond</p>
				</button>
			</div>
		</React.Fragment>
	);
});

async function performProcess(
	account: AccountWithCosmosAndOsmosis,
	process: Process,
	swapForLiquidityConfig: PoolSwapConfig,
	addLiquidityConfig: AddLiquidityConfig,
	amountConfig: BasicAmountConfig,
	lockDuration: plugin.Duration
) {
	const poolId = swapForLiquidityConfig.poolId;
	if (!poolId) {
		throw new Error("Can't calculate the optimized pools");
	}
	if (!account.isReadyToSendMsgs) throw new Error('Account not ready');

	process.start();
	try {
		// Swap for liquidity //
		await process.trackStep(
			{
				type: 'swap',
				status: 'prompt',
				info: `Swapping ${swapForLiquidityConfig.amount.toString()} ${swapForLiquidityConfig.sendCurrency.coinDenom}`,
			},
			async updateStep => {
				let slippage = swapForLiquidityConfig.estimatedSlippage.mul(new Dec('1.05'));
				if (slippage.toDec().lt(new Dec(1))) {
					slippage = new IntPretty(new Dec(1));
				}

				const poolId = swapForLiquidityConfig.poolId;
				if (!poolId) {
					throw new Error("Can't calculate the optimized pools");
				}

				await new Promise<void>(async (resolve, reject) => {
					// from: SwapButton.tsx
					const result = await account.osmosis.sendSwapExactAmountInMsg(
						poolId,
						{
							currency: swapForLiquidityConfig.sendCurrency,
							amount: swapForLiquidityConfig.amount,
						},
						swapForLiquidityConfig.outCurrency,
						slippage
							.locale(false)
							.maxDecimals(18)
							.toString(),
						'',
						/* tx => {
							console.debug('[swapForLiquidity] onFullfil', tx);
							if (!tx) reject();
							else resolve();
						} */
						{
							onBroadcastFailed: (e: Error | undefined) => {
								console.error('[swapForLiquidity] broadcast error', e);
								reject(e);
							},
							onBroadcasted: (txHash: Uint8Array) => {
								console.log('[swapForLiquidity] broadcasted:', txHash);
							},
							onFulfill: (tx: any) => {
								console.debug('[swapForLiquidity] onFullfil', tx);
								console.log('fulfilled:', tx);
								resolve();
							},
						}
					);
					console.debug('[swapForLiquidity] result', result);
					updateStep({ status: 'wait' });
				});
			}
		);

		// Add liquidity to Pool //
		const firstAmount = swapForLiquidityConfig.amount;
		const secondAmount = swapForLiquidityConfig.outAmount.toDec().toString();
		addLiquidityConfig.setAmountAt(0, firstAmount); //TODO: max(<this>, balance)
		addLiquidityConfig.setAmountAt(1, secondAmount);
		const shareOutAmount = addLiquidityConfig.shareOutAmount;
		console.log('Set amounts for pool join:', {
			firstAmount,
			secondAmount,
			shareOut: shareOutAmount,
		});
		if (!shareOutAmount) throw new Error('Invalid shareOutAmount:' + shareOutAmount);
		await process.trackStep(
			{
				type: 'join',
				status: 'prompt',
				info:
					`Adding to pool:\n• ${firstAmount} ${swapForLiquidityConfig.sendCurrency.coinDenom}` +
					`\n• ${swapForLiquidityConfig.outAmount.trim(true).toString()}`,
			},
			async updateStep => {
				console.log('Joining pool:', poolId, 'with', addLiquidityConfig.shareOutAmount?.toString(), 'shares');
				await new Promise<void>(async (resolve, reject) => {
					// from: manage-liquidity.tsx
					const result = await account.osmosis.sendJoinPoolMsg(
						addLiquidityConfig.poolId,
						addLiquidityConfig.shareOutAmount!.toDec().toString(),
						'2.5',
						'',
						{
							onBroadcastFailed: (e: Error | undefined) => {
								console.error('broadcast error', e);
								reject(e);
							},
							onBroadcasted: (txHash: Uint8Array) => {
								console.log('broadcasted:', txHash);
							},
							onFulfill: (tx: any) => {
								console.debug('[sendJoinPoolMsg] onFullfil', tx);
								console.log('fulfilled:', tx);
								resolve();
							},
						}
					);
					console.debug('[sendJoinPoolMsg] result', result);
					updateStep({ status: 'wait' });
				});
			}
		);

		// Bond liquidity to Earn //
		console.log('Amounts for locking:', {
			shareOut: shareOutAmount, //TODO: max(<this>, balance)
		});
		amountConfig.setAmount(shareOutAmount.toString());
		await process.trackStep(
			{ type: 'bond', status: 'prompt', info: `Bonding ${shareOutAmount.toString()} LP tokens` },
			async updateStep => {
				console.log(
					'Bonding tokens:',
					addLiquidityConfig.shareOutAmount?.toString(),
					'for',
					lockDuration.asDays(),
					'days'
				);
				await new Promise<void>(async (resolve, reject) => {
					// from: lock-lp-token.tsx
					const result = await account.osmosis.sendLockTokensMsg(
						lockDuration.asSeconds(),
						[
							{
								currency: amountConfig.sendCurrency,
								amount: amountConfig.amount,
							},
						],
						'',
						tx => {
							console.debug('[sendJoinPoolMsg] onFullfil', tx);
							console.log('fulfilled:', tx);
							resolve();
						}
					);
					console.debug('[sendLockTokensMsg] result', result);
					updateStep({ status: 'wait' });
				});
			}
		);

		process.setSuccessful();
	} finally {
		process.setInactive();
	}
}

function useAutoCalc(swapForLiquidityConfig: PoolSwapConfig) {
	const { chainStore, queriesStore, accountStore } = useStore();
	const { isMobileView } = useWindowSize();
	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);

	const [didAutoCalc, setDidAutoCalc] = useState(false);

	useEffect(() => {
		// if (didAutoCalc) return;

		// get balances
		let inBalance = queries.queryBalances
			.getQueryBech32Address(account.bech32Address)
			.getBalanceFromCurrency(swapForLiquidityConfig.sendCurrency);
		let outBalance = queries.queryBalances
			.getQueryBech32Address(account.bech32Address)
			.getBalanceFromCurrency(swapForLiquidityConfig.outCurrency);
		console.debug('Balances:', [inBalance.toString(), outBalance.toString()]);

		// if one (or both) are 0, handle that smartly
		if (inBalance.toDec().lte(new Dec(0))) {
			if (outBalance.toDec().lte(new Dec(0))) {
				console.debug('Both balances 0');
				return;
			}
			console.log('in balance is 0, out is not - flipping');
			swapForLiquidityConfig.switchInAndOut();
			const inB = inBalance;
			// eslint-disable-next-line react-hooks/exhaustive-deps
			inBalance = outBalance;
			// eslint-disable-next-line react-hooks/exhaustive-deps
			outBalance = inB;
		}

		// Estimate how much the current 'in' balance would be worth in 'out'
		const estimatedOut = swapForLiquidityConfig.pool.pool?.estimateSwapExactAmountIn(
			{
				currency: swapForLiquidityConfig.sendCurrency,
				amount: inBalance.toDec().toString(),
			},
			swapForLiquidityConfig.outCurrency
		);
		if (!estimatedOut) {
			console.error('swap estimation failed:', estimatedOut);
			return;
		}
		console.debug('Estimated swap output:', estimatedOut);

		let swapAmount: CoinPretty;
		if (estimatedOut.tokenOut.toDec().lt(outBalance.toDec())) {
			// Swapping A->B would be worth less than our B balance
			console.debug('estimate out:', estimatedOut.tokenOut.toString(), '<', outBalance.toString(), '=> flipping');
			swapForLiquidityConfig.switchInAndOut();
			// spreadsheet showing formula: https://cryptpad.fr/sheet/#/2/sheet/view/9v8XedWF8B9Ljm13UGJ-lgtW1PzfcueL+-lf2AkvTSc/embed/
			const difference = outBalance.sub(estimatedOut.tokenOut);
			swapAmount = difference //
				.mul(new Dec('0.5')); // we want to exchange half of the difference
		} else {
			// Swapping A->B would be worth more than our B balance
			const difference = outBalance.sub(estimatedOut.tokenOut);
			console.debug(
				'estimate out:',
				estimatedOut.tokenOut.toString(),
				'>',
				outBalance.toString(),
				', difference:',
				difference.toString()
			);
			const price = inBalance.quo(estimatedOut.tokenOut);
			swapAmount = difference
				.mul(price) // we need to convert difference to B
				.mul(new Dec('-0.5')); // we want to fill up half of the difference
		}
		const finalSwapAmount = swapAmount
			.trim(true)
			.maxDecimals(6)
			.shrink(true)
			.hideDenom(true)
			.locale(false)
			.toString();
		if (swapForLiquidityConfig.amount == finalSwapAmount) {
			console.debug("finalSwapAmount didn't change:", finalSwapAmount.toString());
		}
		console.debug('Updating swap amount:', finalSwapAmount.toString());
		swapForLiquidityConfig.setAmount(finalSwapAmount);
		setDidAutoCalc(true);
	}, [swapForLiquidityConfig, didAutoCalc, setDidAutoCalc, queries.queryBalances, account.bech32Address]);

	return [didAutoCalc, () => setDidAutoCalc(false)];
}
