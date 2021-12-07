import { Duration } from 'dayjs/plugin/duration';
import { IFeeConfig } from '@keplr-wallet/hooks';
import { CoinPretty, Dec, IntPretty, DecUtils } from '@keplr-wallet/unit';
import { findIndex } from 'lodash-es';
import { Process } from 'src/hooks/process';
import { PoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { ChainStore } from 'src/stores/chain';
import { AccountWithCosmosAndOsmosis } from 'src/stores/osmosis/account';
import { QueriesWithCosmosAndOsmosis } from 'src/stores/osmosis/query';
import { DeepReadonly } from 'utility-types';
import { AddLiquidityConfig } from '../manage-liquidity';
import { BasicAmountConfig } from '../../hooks/tx/basic-amount-config';
import { ObservableQueryBalancesInner } from '@keplr-wallet/stores';
import _ from 'lodash';
import { Currency } from '@keplr-wallet/types';
import { coinDisplay, toCoinPretty } from 'src/utils/currency';

export async function performAutoBondProcess(
	process: Process,
	account: AccountWithCosmosAndOsmosis,
	queries: DeepReadonly<QueriesWithCosmosAndOsmosis>,
	chainStore: ChainStore,
	swapConfig: PoolSwapConfig,
	swapFeeConfig: IFeeConfig,
	addLiquidityConfig: AddLiquidityConfig,
	lockDuration: plugin.Duration,
	allIn: boolean,
	matchWithOther: boolean
) {
	const poolId = swapConfig.poolId;
	if (!poolId) {
		throw new Error("Can't calculate the optimized pools");
	}
	if (!account.isReadyToSendMsgs) throw new Error('Account not ready');
	const balanceQuery = queries.queryBalances.getQueryBech32Address(account.bech32Address);
	process.start();

	const { swapAmount, bondAmount } = calculateSwap(swapConfig, swapFeeConfig, allIn, matchWithOther, balanceQuery);
	if (swapAmount) swapConfig.setAmount(swapAmount.toDec().toString());

	try {
		// Swap for liquidity //
		if (swapAmount) {
			await performSwap(process, swapConfig, account, balanceQuery);
		}

		// Add liquidity to Pool //
		const finalShareAmount: IntPretty = await performJoin(
			process,
			addLiquidityConfig,
			swapConfig,
			bondAmount,
			poolId,
			account
		);

		// Bond liquidity to Earn //
		await performBond(process, finalShareAmount, chainStore, account, queries, poolId, lockDuration);

		process.setSuccessful();
	} finally {
		process.setInactive();
	}
}

function calculateSwap(
	swapConfig: PoolSwapConfig,
	swapFeeConfig: IFeeConfig,
	allIn: boolean,
	matchWithOther: boolean,
	balanceQuery: ObservableQueryBalancesInner,
	recursionFlag = false
): {
	swapAmount: CoinPretty | null;
	bondAmount: CoinPretty | null;
} {
	const [inBalance, outBalance] = [swapConfig.sendCurrency, swapConfig.outCurrency].map(c =>
		balanceQuery.getBalanceFromCurrency(c)
	);
	if (!inBalance.toDec().isPositive()) {
		throw new Error('IN balance is <= 0');
	}
	const poolRatios = swapConfig.pool.pool?.poolRatios;
	console.log(
		'pool ratio',
		poolRatios?.map(r => _.mapValues(r, _.toString))
	);
	const poolRatio = new Dec('0.5'); //TODO: handle non-50/50 pools

	// Estimate how much the current 'in' balance would be worth in 'out'
	const estimatedOut = swapConfig.outAmount;
	console.debug('Estimated swap output:', estimatedOut.toString());
	if (!estimatedOut.toDec().isPositive()) {
		if (recursionFlag) throw new Error('No swap output both ways');
		swapConfig.switchInAndOut();
		return calculateSwap(swapConfig, swapFeeConfig, allIn, matchWithOther, balanceQuery, true);
	}

	let swapAmount: CoinPretty | null;
	let bondAmount: CoinPretty | null;
	// spreadsheet showing formulas: https://cryptpad.fr/sheet/#/2/sheet/view/9v8XedWF8B9Ljm13UGJ-lgtW1PzfcueL+-lf2AkvTSc/embed/
	const selectedIn = toCoinPretty(swapConfig.amount, swapConfig.sendCurrency);
	const swapRatioInToOut = selectedIn.toDec().quo(estimatedOut.toDec());
	const outBalanceMinusSwapResult = outBalance.sub(estimatedOut);
	const fee = swapFeeConfig.fee?.toDec() ?? new Dec('0');
	console.log(
		'Estimating swap:',
		_.mapValues({ estimatedOut, outBalance, difference: outBalanceMinusSwapResult, swapRatioInToOut, fee }, _.toString)
	);
	if (allIn) {
		// Calculate needed swap to balance liquidity on both sides
		bondAmount = null; // meaning: maximum we have
		if (
			outBalanceMinusSwapResult
				.toDec()
				.abs()
				.lte(fee)
		) {
			console.log('Swap amount is not much more than the fee, skipping');
			swapAmount = null;
		} else if (outBalanceMinusSwapResult.toDec().isPositive()) {
			// Swapping IN->OUT would be worth less than our OUT balance, i.e. we have more OUT in terms of value
			console.debug('estimate out < outBalance -> flipping');
			swapConfig.switchInAndOut(); // Flip IN and OUT (will only affect swapConfig, not our variables)
			swapAmount = outBalanceMinusSwapResult.mul(poolRatio); // we want to exchange half of the difference
		} else {
			// Swapping IN->OUT would be worth more than our OUT balance, i.e. we have more IN in terms of value
			console.debug('estimate out > outBalance -> flipping');
			swapAmount = outBalanceMinusSwapResult
				.mul(new Dec('-1')) // as we calculated from the higher side, the difference is negative
				.mul(swapRatioInToOut) // we need to convert difference to IN
				// TODO: not sure if for non-50/50 pools 1 - poolRatio is needed
				.mul(poolRatio); // we want to fill up half of the difference (so that we meet in the middle for balanced liquidity)
		}
	} else {
		if (matchWithOther) {
			if (!outBalanceMinusSwapResult.toDec().isNegative() /* positive or 0 */) {
				console.log(`Swap not needed (sufficient OUT balance), skipping`, _.mapValues({ outBalance, fee }, _.toString));
				swapAmount = null;
				bondAmount = selectedIn;
			} else {
				// Swapping IN->OUT would be worth more than our OUT balance, i.e. we need more OUT for balanced liquidity
				swapAmount = outBalanceMinusSwapResult
					.mul(new Dec('-1')) // as we calculated from the higher side, the difference is negative
					.mul(swapRatioInToOut) // we need to convert difference to IN
					// TODO: not sure if for non-50/50 pools 1 - poolRatio is needed
					.mul(poolRatio); // we want to fill up half of the difference (so that we meet in the middle for balanced liquidity)
				bondAmount = selectedIn.sub(swapAmount);
				if (swapAmount.toDec().lte(fee)) {
					console.log(
						`Swap amount is not much more than the fee, skipping`,
						_.mapValues({ swapAmount, fee }, _.toString)
					);
					swapAmount = null;
					bondAmount = selectedIn;
				}
			}
		} else {
			swapAmount = selectedIn.mul(poolRatio); // we want to swap part of it (so that we meet in the middle for balanced liquidity)
			bondAmount = selectedIn.sub(swapAmount); // the remaining part
		}
	}

	console.debug('Swap calculation result:', _.mapValues({ swapAmount, bondAmount }, _.toString));
	return { swapAmount, bondAmount };
}

async function performSwap(
	process: Process,
	swapConfig: PoolSwapConfig,
	account: AccountWithCosmosAndOsmosis,
	balanceQuery: ObservableQueryBalancesInner
) {
	await process.trackStep(
		{
			type: 'swap',
			status: 'prompt',
			info: `Swapping ${coinDisplay(toCoinPretty(swapConfig.amount, swapConfig.sendCurrency))}`,
		},
		async updateStep => {
			let slippage = swapConfig.estimatedSlippage.mul(new Dec('1.05'));
			if (slippage.toDec().lt(new Dec(1))) {
				slippage = new IntPretty(new Dec(1));
			}

			const poolId = swapConfig.poolId;
			if (!poolId) {
				throw new Error("Can't calculate the optimized pools");
			}

			await new Promise<void>(async (resolve, reject) => {
				// from: SwapButton.tsx
				const result = await account.osmosis.sendSwapExactAmountInMsg(
					poolId,
					{
						currency: swapConfig.sendCurrency,
						amount: swapConfig.amount,
					},
					swapConfig.outCurrency,
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
			const swapOutAmount = swapConfig.outAmount.toDec();

			console.debug('Refreshing balances');
			updateStep({ status: 'wait' });
			let tries = 0;
			while (true) {
				// I didn't figure out how to wait for new balances, so I did this loop check
				await balanceQuery.fetch();
				const balances = [swapConfig.sendCurrency, swapConfig.outCurrency].map(c =>
					balanceQuery.getBalanceFromCurrency(c)
				);
				console.debug(
					'New balances:',
					balances.map(b => b.toString())
				);

				if (
					balances[1]
						.toDec()
						.mul(new Dec('0.95')) // allow for slippage or whatever
						.gte(swapOutAmount)
				) {
					break;
				}
				tries++;
				if (tries > 20) throw new Error('Timeout while waiting for balances');
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}
	);
}

async function performJoin(
	process: Process,
	addLiquidityConfig: AddLiquidityConfig,
	swapConfig: PoolSwapConfig,
	bondAmount: CoinPretty | null,
	poolId: string,
	account: AccountWithCosmosAndOsmosis
) {
	let finalShareAmount: IntPretty = (null as unknown) as IntPretty; // https://stackoverflow.com/a/61598241
	await process.trackStep({ type: 'join', status: 'wait', info: 'Joining pool' }, async updateStep => {
		const indexOfIn = findIndex(addLiquidityConfig.poolAssetConfigs, poolAssetConfig => {
			return poolAssetConfig.currency.coinDenom === swapConfig.sendCurrency.coinDenom;
		});
		const indexOfOut = findIndex(addLiquidityConfig.poolAssetConfigs, poolAssetConfig => {
			return poolAssetConfig.currency.coinDenom === swapConfig.outCurrency.coinDenom;
		});

		// Setting max amount and then checking if intended bondAmount is lower (this way we avoid using an amount that's higher than the max)
		addLiquidityConfig.setMax();
		const calculatedMaxIn = addLiquidityConfig.poolAssetConfigs[indexOfIn].amount;
		console.log('Calculated max amount for pool join:', {
			calculatedMaxIn,
			shareOut: addLiquidityConfig.shareOutAmount?.toDec()?.toString(),
		});
		if (bondAmount && new Dec(calculatedMaxIn).gt(bondAmount.toDec())) {
			console.debug(
				'Max amount would be bigger than what we want to bond, so we use our calculation:',
				bondAmount.toString()
			);
			addLiquidityConfig.setAmountAt(indexOfIn, bondAmount.toDec().toString());
		}
		const shareOutAmount = addLiquidityConfig.shareOutAmount;
		const calculatedIn = addLiquidityConfig.poolAssetConfigs[indexOfIn];
		const calculatedOut = addLiquidityConfig.poolAssetConfigs[indexOfOut];
		if (calculatedIn.getError()) throw calculatedIn.getError();
		if (calculatedOut.getError()) throw calculatedOut.getError();
		console.log('Final shareOutAmount for pool join:', shareOutAmount?.toDec()?.toString());
		if (!shareOutAmount) throw new Error('Invalid shareOutAmount:' + shareOutAmount);

		// Perform add to pool //
		updateStep({
			status: 'wait',
			info:
				`Adding to pool:\n• ${coinDisplay(toCoinPretty(calculatedIn.amount, swapConfig.sendCurrency))}\n` +
				`• ${coinDisplay(toCoinPretty(calculatedOut.amount, swapConfig.outCurrency))}`,
		});

		console.log('Joining pool:', poolId, 'with', addLiquidityConfig.shareOutAmount?.toString(), 'shares');
		await new Promise<void>(async (resolve, reject) => {
			try {
				// from: manage-liquidity.tsx
				const result = await account.osmosis.sendJoinPoolMsg(
					addLiquidityConfig.poolId,
					shareOutAmount.toDec().toString(),
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
			} catch (err) {
				reject(err);
			}
		});

		finalShareAmount = shareOutAmount;
	});
	return finalShareAmount;
}

async function performBond(
	process: Process,
	finalShareAmount: IntPretty,
	chainStore: ChainStore,
	account: AccountWithCosmosAndOsmosis,
	queries: DeepReadonly<QueriesWithCosmosAndOsmosis>,
	poolId: string,
	lockDuration: Duration
) {
	await process.trackStep(
		{
			type: 'bond',
			status: 'prompt',
			info: `Bonding ${finalShareAmount.maxDecimals(6).toString()} LP tokens`,
		},
		async updateStep => {
			if (!finalShareAmount) throw new Error('Invalid finalShareAmount:' + finalShareAmount);
			console.log('Amounts for locking:', {
				shareOut: finalShareAmount.toDec().toString(), //TODO: max(<this>, balance)
			});
			const lockAmountConfig = new BasicAmountConfig(
				chainStore,
				chainStore.current.chainId,
				account.bech32Address,
				queries.osmosis.queryGammPoolShare.getShareCurrency(poolId),
				queries.queryBalances
			);
			lockAmountConfig.setAmount(finalShareAmount.toDec().toString());
			console.log('Bonding tokens:', finalShareAmount.toString(), 'for', lockDuration.asDays(), 'days');
			await new Promise<void>(async (resolve, reject) => {
				try {
					// from: lock-lp-token.tsx
					const result = await account.osmosis.sendLockTokensMsg(
						lockDuration.asSeconds(),
						[
							{
								currency: lockAmountConfig.sendCurrency,
								amount: lockAmountConfig.amount,
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
				} catch (err) {
					reject(err);
				}
			});
		}
	);
}
