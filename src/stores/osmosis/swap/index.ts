import { computed, makeObservable, observable } from 'mobx';
import { Dec, Int, IntPretty } from '@keplr-wallet/unit';
import { ObservableQueryPools } from '../query/pools';
import { AppCurrency, Currency } from '@keplr-wallet/types';
import { computedFn } from 'mobx-utils';
import { QueriedPoolBase } from '../query/pool';

export interface SwapManagerPoolCurrency {
	poolId: string;
	currencies: Currency[];
}

export class GammSwapManager {
	@observable.ref
	protected swapCurrencies: SwapManagerPoolCurrency[];

	constructor(swapCurrencies: SwapManagerPoolCurrency[]) {
		this.swapCurrencies = swapCurrencies;

		makeObservable(this);
	}

	@computed
	get swappableCurrencies(): Currency[] {
		const currencies: Map<string, Currency> = new Map();

		for (const swapCurrency of this.swapCurrencies) {
			for (const currency of swapCurrency.currencies) {
				if (!currencies.has(currency.coinMinimalDenom)) {
					currencies.set(currency.coinMinimalDenom, currency);
				}
			}
		}

		return Array.from(currencies.values());
	}

	@computed
	get swapManagerPoolCurrencyMapPerMinimalDenom(): Map<
		string,
		(SwapManagerPoolCurrency & {
			currencyMap: Map<string, Currency>;
		})[]
	> {
		const map: Map<
			string,
			(SwapManagerPoolCurrency & {
				currencyMap: Map<string, Currency>;
			})[]
		> = new Map();

		for (const swapCurrency of this.swapCurrencies) {
			const currencyMap: Map<string, Currency> = new Map();

			for (const currency of swapCurrency.currencies) {
				currencyMap.set(currency.coinMinimalDenom, currency);

				if (!map.has(currency.coinMinimalDenom)) {
					map.set(currency.coinMinimalDenom, []);
				}

				map.set(
					currency.coinMinimalDenom,
					map.get(currency.coinMinimalDenom)!.concat({
						...swapCurrency,
						currencyMap,
					})
				);
			}
		}

		return map;
	}

	// XXX: Currently, only calculate the one hopping.
	protected readonly getMultihopSwappablePools = computedFn((inMinimalDenom: string, outMinimalDenom: string): {
		poolIds: [string, string];
		hopMinimalDenom: string;
	}[] => {
		const map = this.swapManagerPoolCurrencyMapPerMinimalDenom;

		const result: {
			poolIds: [string, string];
			hopMinimalDenom: string;
		}[] = [];

		const targets = map.get(outMinimalDenom);
		if (!targets) {
			return [];
		}

		const firstSwappables = map.get(inMinimalDenom);
		if (!firstSwappables) {
			return [];
		}

		for (const firstSwappable of firstSwappables) {
			// Swipe the in currency
			const hoppableCurrencies = firstSwappable.currencies.filter(cur => cur.coinMinimalDenom !== inMinimalDenom);
			for (const target of targets) {
				for (const hopCurrency of hoppableCurrencies) {
					if (target.currencyMap.has(hopCurrency.coinMinimalDenom)) {
						result.push({
							poolIds: [firstSwappable.poolId, target.poolId],
							hopMinimalDenom: hopCurrency.coinMinimalDenom,
						});
					}
				}
			}
		}

		return result;
	});

	protected readonly getSwappablePoolIds = computedFn((inMinimalDenom: string, outMinimalDenom: string): string[] => {
		const map = this.swapManagerPoolCurrencyMapPerMinimalDenom;

		const swappables = map.get(inMinimalDenom);
		if (!swappables) {
			return [];
		}

		const result: string[] = [];

		for (const swappable of swappables) {
			if (swappable.currencyMap.has(outMinimalDenom)) {
				result.push(swappable.poolId);
			}
		}

		return result;
	});

	readonly computeOptimizedRoutes = computedFn(
		(
			currencies: AppCurrency[],
			queryPool: ObservableQueryPools,
			inAmount: string,
			inCurrency: AppCurrency,
			outCurrency: AppCurrency
		):
			| {
					swaps: {
						poolId: string;
						outCurrency: AppCurrency;
					}[];
					multihop: boolean;
					spotPrice: IntPretty;
					spotPriceWithoutSwapFee: IntPretty;
					swapFees: IntPretty[];
			  }
			| undefined => {
			const swappablePoolIds = this.getSwappablePoolIds(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom);
			if (swappablePoolIds.length === 0) {
				// Try multihop
				const multihopPools = this.getMultihopSwappablePools(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom);

				let bestPool:
					| (typeof multihopPools[0] & {
							spotPrice: IntPretty;
							outAmount: IntPretty;
					  })
					| undefined;

				for (const multihopPool of multihopPools) {
					const [pool1, pool2] = [
						queryPool.getPool(multihopPool.poolIds[0]),
						queryPool.getPool(multihopPool.poolIds[1]),
					];

					const hopCurrency = currencies.find(cur => cur.coinMinimalDenom === multihopPool.hopMinimalDenom);
					if (pool1 && pool2 && hopCurrency) {
						try {
							if (!inAmount) {
								throw new Error('In amount is empty');
							}

							const firstOutAmount = pool1
								.estimateSwapExactAmountIn(
									{
										currency: inCurrency,
										amount: inAmount,
									},
									hopCurrency
								)
								.tokenOut.toDec();

							const secondOutAmount = pool2
								.estimateSwapExactAmountIn(
									{
										currency: hopCurrency,
										amount: firstOutAmount.truncate().toString(),
									},
									outCurrency
								)
								.tokenOut.toDec();

							const spotPrice = pool1
								.calculateSpotPrice(inCurrency.coinMinimalDenom, hopCurrency.coinMinimalDenom)
								.mul(pool2.calculateSpotPrice(hopCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom));

							if (!bestPool) {
								bestPool = {
									...multihopPool,
									spotPrice,
									outAmount: new IntPretty(secondOutAmount.truncate()),
								};
							} else if (bestPool.outAmount.toDec().lt(secondOutAmount.truncateDec())) {
								bestPool = {
									...multihopPool,
									spotPrice,
									outAmount: new IntPretty(secondOutAmount.truncate()),
								};
							}
						} catch (e) {
							if (e?.message !== 'In amount is empty') {
								console.log('Unexpected error on calculate the best pool for multihop swap', e);
							}

							const spotPrice = pool1
								.calculateSpotPrice(inCurrency.coinMinimalDenom, hopCurrency.coinMinimalDenom)
								.mul(pool2.calculateSpotPrice(hopCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom));

							if (!bestPool) {
								bestPool = {
									...multihopPool,
									spotPrice,
									outAmount: new IntPretty(0),
								};
							} else if (bestPool.spotPrice.toDec().gt(spotPrice.toDec())) {
								bestPool = {
									...multihopPool,
									spotPrice,
									outAmount: new IntPretty(0),
								};
							}
						}
					}
				}

				if (!bestPool) {
					return;
				}

				const [pool1, pool2] = [queryPool.getPool(bestPool.poolIds[0])!, queryPool.getPool(bestPool.poolIds[1])!];

				const spotPriceWithoutSwapFee = pool1
					.calculateSpotPriceWithoutSwapFee(inCurrency.coinMinimalDenom, bestPool.hopMinimalDenom)
					.mul(pool2.calculateSpotPriceWithoutSwapFee(bestPool.hopMinimalDenom, outCurrency.coinMinimalDenom));

				return {
					swaps: [
						{
							poolId: bestPool.poolIds[0],
							outCurrency: currencies.find(cur => cur.coinMinimalDenom === bestPool!.hopMinimalDenom)!,
						},
						{
							poolId: bestPool.poolIds[1],
							outCurrency,
						},
					],
					multihop: true,
					spotPrice: bestPool.spotPrice,
					spotPriceWithoutSwapFee,
					swapFees: [pool1.swapFee, pool2.swapFee],
				};
			} else {
				const pools: QueriedPoolBase[] = [];
				for (const poolId of swappablePoolIds) {
					const pool = queryPool.getPool(poolId);
					if (pool) {
						pools.push(pool);
					}
				}

				if (pools.length === 0) {
					return;
				}

				if (pools.length === 1) {
					const pool = pools[0];

					return {
						swaps: [
							{
								poolId: pool.id,
								outCurrency,
							},
						],
						multihop: false,
						spotPrice: pool.calculateSpotPrice(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom),
						spotPriceWithoutSwapFee: pool.calculateSpotPriceWithoutSwapFee(
							inCurrency.coinMinimalDenom,
							outCurrency.coinMinimalDenom
						),
						swapFees: [pool.swapFee],
					};
				}

				try {
					if (!inAmount) {
						throw new Error('In amount is empty');
					}

					const poolOutAmountMap: Map<string, Int> = new Map();

					for (const pool of pools) {
						const outAmount = pool
							.estimateSwapExactAmountIn(
								{
									currency: inCurrency,
									amount: inAmount,
								},
								outCurrency
							)
							.tokenOut.toDec()
							.truncate();

						poolOutAmountMap.set(pool.id, outAmount);
					}

					// Sort pool by estimated out amount.
					pools.sort((pool1, pool2) => {
						const outAmount1 = poolOutAmountMap.get(pool1.id) ?? new Int(0);
						const outAmount2 = poolOutAmountMap.get(pool2.id) ?? new Int(0);
						if (outAmount1.equals(outAmount2)) {
							return 0;
						}
						return outAmount1.gt(outAmount2) ? -1 : 1;
					});
				} catch (e) {
					if (e?.message !== 'In amount is empty') {
						console.log('Unexpected error on calculate the best pool for multihop swap', e);

						// Sort pool by the spot price.
						pools.sort((pool1, pool2) => {
							const sp1 = pool1.calculateSpotPrice(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom).toDec();
							const sp2 = pool2.calculateSpotPrice(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom).toDec();
							if (sp1.equals(sp2)) {
								return 0;
							}
							return sp1.gt(sp2) ? 1 : -1;
						});
					}
				}

				const pool = pools[0];

				/*
				// TODO: Compute the optimized route.
				// Remove the pools that has greater slippage slope than the first pool
				const others: {
					pool: QueriedPoolBase;
					spotPrice: Dec;
					slippageSlope: Dec;
				}[] = [];
				for (const remaining of pools.slice(1)) {
					const slippageSlope = remaining
						.calculateSlippageSlope(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom)
						.toDec();
					if (
						slippageSlope.lt(
							pool.calculateSlippageSlope(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom).toDec()
						)
					) {
						others.push({
							pool: remaining,
							spotPrice: remaining
								.calculateSpotPrice(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom)
								.toDec(),
							slippageSlope,
						});
					}
				}
				 */

				return {
					swaps: [
						{
							poolId: pool.id,
							outCurrency,
						},
					],
					multihop: false,
					spotPrice: pool.calculateSpotPrice(inCurrency.coinMinimalDenom, outCurrency.coinMinimalDenom),
					spotPriceWithoutSwapFee: pool.calculateSpotPriceWithoutSwapFee(
						inCurrency.coinMinimalDenom,
						outCurrency.coinMinimalDenom
					),
					swapFees: [pool.swapFee],
				};
			}
		}
	);
}
