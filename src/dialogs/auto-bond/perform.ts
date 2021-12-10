import { IFeeConfig } from '@keplr-wallet/hooks';
import { AccountStore, ObservableQueryBalancesInner, QueriesStore } from '@keplr-wallet/stores';
import { Currency } from '@keplr-wallet/types';
import { CoinPretty, Dec, IntPretty } from '@keplr-wallet/unit';
import { Duration } from 'dayjs/plugin/duration';
import _ from 'lodash';
import { findIndex } from 'lodash-es';
import { doIbcDeposit } from 'src/dialogs/Transfer';
import { Process, StepUpdate } from 'src/hooks/process';
import { FakeFeeConfig } from 'src/hooks/tx';
import { PoolSwapConfig } from 'src/pages/pool/components/PoolInfoHeader/usePoolSwapConfig';
import { ChainStore } from 'src/stores/chain';
import { IBCTransferHistoryStore } from 'src/stores/ibc-history';
import { AccountWithCosmosAndOsmosis } from 'src/stores/osmosis/account';
import { QueriesWithCosmosAndOsmosis } from 'src/stores/osmosis/query';
import { coinDisplay, toCoinPretty } from 'src/utils/currency';
import { getIbcBalances } from 'src/utils/ibc';
import { DeepReadonly } from 'utility-types';
import { BasicAmountConfig } from '../../hooks/tx/basic-amount-config';
import { AddLiquidityConfig } from '../manage-liquidity';

export async function performAutoBondProcess(
	process: Process,
	accountStore: AccountStore<AccountWithCosmosAndOsmosis>,
	queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>,
	chainStore: ChainStore,
	ibcTransferHistoryStore: IBCTransferHistoryStore,
	ibcSelection: Currency[],
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
	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);
	if (!account.isReadyToSendMsgs) throw new Error('Account not ready');
	const balanceQuery = queries.queryBalances.getQueryBech32Address(account.bech32Address);
	process.start();
	try {
		// IBC transfer //
		if (ibcSelection.length) {
			await depositIbc(process, ibcSelection, accountStore, queriesStore, ibcTransferHistoryStore, chainStore);
		}

		const { swapAmount, bondAmount } = calculateSwap(swapConfig, swapFeeConfig, allIn, matchWithOther, balanceQuery);
		if (swapAmount) swapConfig.setAmount(swapAmount.toDec().toString());

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

///////////////
// CALCULATE //
///////////////

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

/////////////
// PERFORM //
/////////////

export async function depositIbc(
	process: Process,
	ibcSelection: Currency[],
	accountStore: AccountStore<AccountWithCosmosAndOsmosis>,
	queriesStore: QueriesStore<QueriesWithCosmosAndOsmosis>,
	ibcTransferHistoryStore: IBCTransferHistoryStore,
	chainStore: ChainStore
) {
	const queries = queriesStore.get(chainStore.current.chainId);
	const account = accountStore.getAccount(chainStore.current.chainId);
	const balanceQuery = queries.queryBalances.getQueryBech32Address(account.bech32Address);

	let balances = getIbcBalances(ibcSelection, chainStore, accountStore, queriesStore);
	// Maybe, selected currencies where from LocalStorage and their accounts are not initialised yet.
	const uninitialised = balances.filter(b => !b?.accInitialized);
	if (uninitialised.length) {
		await Promise.all(uninitialised.map(async b => await b?.initAcc()));
		balances = getIbcBalances(ibcSelection, chainStore, accountStore, queriesStore); // refresh after
	}
	await Promise.all(
		ibcSelection.map(async currency => {
			const balance = _.find(balances, c => c.balance.denom == currency.coinDenom);
			if (!balance) throw new Error('No IBC balance for ' + currency.coinDenom);

			const fakeFee = new FakeFeeConfig(
				chainStore,
				balance.channelInfo.counterpartyChainId,
				account.msgOpts.swapExactAmountIn.gas
			);
			const amount = balance.balance
				.mul(new Dec('0.95')) // leave some crumbs for future fees
				.sub(fakeFee.fee!.toDec()); // subtract fake fee
			console.log(balance.balance.toString(), '-', fakeFee.fee?.toString(), '=', amount.toString());

			if (!amount.toDec().isPositive()) return null;
			const amountConfig = new BasicAmountConfig(
				chainStore,
				chainStore.current.chainId,
				account.bech32Address,
				balance.balance.currency,
				queries.queryBalances
			);
			amountConfig.setAmount(amount.toDec().toString());
			await process.trackStep(
				{
					type: 'swap',
					status: 'prompt',
					info: `IBC: ${amount.toString()}`,
				},
				async updateStep => {
					await new Promise((resolve, reject) => {
						doIbcDeposit(
							accountStore.getAccount(balance.channelInfo.counterpartyChainId),
							balance.channelInfo.destChannelId,
							chainStore,
							amountConfig,
							account.bech32Address,
							ibcTransferHistoryStore,
							balance.channelInfo.counterpartyChainId,
							accountStore.getAccount(balance.channelInfo.counterpartyChainId).bech32Address,
							resolve // onFullfilled
						)
							.then(() => updateStep({ status: 'wait' })) // onBroadcasted
							.catch(reject);
					});
					await waitForBalanceUpdate(balanceQuery, amount.toDec(), amount.currency);
				}
			);
			return amount;
		})
	);
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

			updateStep({ status: 'wait' });
			await waitForBalanceUpdate(balanceQuery, swapOutAmount, swapConfig.outCurrency);
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

async function waitForBalanceUpdate(balanceQuery: ObservableQueryBalancesInner, amount: Dec, currency: Currency) {
	console.debug('Refreshing balances');
	let tries = 0;
	while (true) {
		// I didn't figure out how to wait for new balances, so I did this loop check
		await balanceQuery.fetch();
		const balance = balanceQuery.getBalanceFromCurrency(currency);
		console.debug('New balance:', balance.toString());

		if (
			balance
				.toDec()
				.mul(new Dec('0.95')) // allow for slippage or whatever
				.gte(amount)
		) {
			break;
		}
		tries++;
		if (tries > 50) throw new Error('Timeout while waiting for balances');
		await new Promise(resolve => setTimeout(resolve, 1000));
	}
}
