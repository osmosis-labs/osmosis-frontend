import { GAMMPoolData } from '../../pool/types';
import { GAMMPool } from '../../pool';
import { ChainGetter, MsgOpt } from '@keplr-wallet/stores';
import { CoinPretty, DecUtils, IntPretty, Int, Coin, Dec } from '@keplr-wallet/unit';
import { computed, makeObservable, observable } from 'mobx';
import { AppCurrency, Currency, FiatCurrency } from '@keplr-wallet/types';
import { Msg } from '@cosmjs/launchpad';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { computedFn } from 'mobx-utils';
import { Duration } from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

export class QueriedPoolBase {
	@observable.ref
	protected readonly pool: GAMMPool;

	constructor(protected readonly chainId: string, protected readonly chainGetter: ChainGetter, data: GAMMPoolData) {
		this.pool = new GAMMPool(data);

		makeObservable(this);
	}

	get id(): string {
		return this.pool.id;
	}

	@computed
	get smoothWeightChangeParams():
		| {
				startTime: Date;
				endTime: Date;
				duration: Duration;
				initialPoolWeights: {
					currency: AppCurrency;
					weight: IntPretty;
					ratio: IntPretty;
				}[];
				targetPoolWeights: {
					currency: AppCurrency;
					weight: IntPretty;
					ratio: IntPretty;
				}[];
		  }
		| undefined {
		if (!this.pool.poolParamsRaw.smoothWeightChangeParams) {
			return undefined;
		}

		const params = this.pool.poolParamsRaw.smoothWeightChangeParams;

		const startTime = new Date(params.start_time);
		const duration = dayjs.duration(parseInt(params.duration.replace('s', '')) * 1000);
		const endTime = dayjs(startTime)
			.add(duration)
			.toDate();

		let totalInitialPoolWeight = new Dec(0);
		for (const weight of params.initialPoolWeights) {
			totalInitialPoolWeight = totalInitialPoolWeight.add(new Dec(weight.weight));
		}
		const initialPoolWeights = params.initialPoolWeights.map(weight => {
			return {
				currency: this.chainGetter.getChain(this.chainId).forceFindCurrency(weight.token.denom),
				weight: new IntPretty(new Dec(weight.weight)),
				ratio: new IntPretty(new Dec(weight.weight)).quo(totalInitialPoolWeight).decreasePrecision(2),
			};
		});

		let totalTargetPoolWeight = new Dec(0);
		for (const weight of params.targetPoolWeights) {
			totalTargetPoolWeight = totalTargetPoolWeight.add(new Dec(weight.weight));
		}
		const targetPoolWeights = params.targetPoolWeights.map(weight => {
			return {
				currency: this.chainGetter.getChain(this.chainId).forceFindCurrency(weight.token.denom),
				weight: new IntPretty(new Dec(weight.weight)),
				ratio: new IntPretty(new Dec(weight.weight)).quo(totalTargetPoolWeight).decreasePrecision(2),
			};
		});

		return {
			startTime,
			endTime,
			duration,
			initialPoolWeights,
			targetPoolWeights,
		};
	}

	calculateSpotPrice(inMinimalDenom: string, outMinimalDenom: string): IntPretty {
		const calculated = this.pool.calculateSpotPrice(inMinimalDenom, outMinimalDenom);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const inCurrency = chainInfo.forceFindCurrency(inMinimalDenom);
		const outCurrecny = chainInfo.forceFindCurrency(outMinimalDenom);

		const decimalDelta = inCurrency.coinDecimals - outCurrecny.coinDecimals;

		return new IntPretty(calculated)
			.quo(DecUtils.getPrecisionDec(decimalDelta))
			.maxDecimals(4)
			.trim(true);
	}

	calculateSpotPriceWithoutSwapFee(inMinimalDenom: string, outMinimalDenom: string): IntPretty {
		const calculated = this.pool.calculateSpotPriceWithoutSwapFee(inMinimalDenom, outMinimalDenom);

		const chainInfo = this.chainGetter.getChain(this.chainId);
		const inCurrency = chainInfo.forceFindCurrency(inMinimalDenom);
		const outCurrecny = chainInfo.forceFindCurrency(outMinimalDenom);

		const decimalDelta = inCurrency.coinDecimals - outCurrecny.coinDecimals;

		return new IntPretty(calculated)
			.quo(DecUtils.getPrecisionDec(decimalDelta))
			.maxDecimals(4)
			.trim(true);
	}

	calculateSlippageSlope(inMinimalDenom: string, outMinimalDenom: string): IntPretty {
		const calculated = this.pool.calculateSlippageSlope(inMinimalDenom, outMinimalDenom);
		return new IntPretty(calculated).maxDecimals(4).trim(true);
	}

	estimateJoinSwap(
		shareOutAmount: string,
		shareCoinDecimals: number
	): {
		tokenIns: CoinPretty[];
	} {
		const estimated = this.pool.estimateJoinPool(
			new Dec(shareOutAmount).mul(DecUtils.getPrecisionDec(shareCoinDecimals)).truncate()
		);

		const tokenIns = estimated.tokenIns.map(primitive => {
			const currency = this.chainGetter.getChain(this.chainId).findCurrency(primitive.denom);
			if (!currency) {
				throw new Error('Unknown currency');
			}

			return new CoinPretty(currency, primitive.amount);
		});

		return {
			tokenIns,
		};
	}

	estimateJoinSwapExternAmountIn(
		tokenIn: {
			currency: Currency;
			amount: string;
		},
		shareCoinDecimals: number
	): {
		shareOutAmount: IntPretty;
		shareOutAmountRaw: Int;
	} {
		const amount = new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

		const estimated = this.pool.estimateJoinSwapExternAmountIn(coin);

		return {
			shareOutAmount: new IntPretty(estimated.shareOutAmount).increasePrecision(shareCoinDecimals),
			shareOutAmountRaw: estimated.shareOutAmount,
		};
	}

	estimateExitSwap(shareInAmount: string, shareCoinDecimals: number): { tokenOuts: CoinPretty[] } {
		const estimated = this.pool.estimateExitPool(
			new Dec(shareInAmount).mul(DecUtils.getPrecisionDec(shareCoinDecimals)).truncate()
		);

		const tokenOuts = estimated.tokenOuts.map(primitive => {
			const currency = this.chainGetter.getChain(this.chainId).findCurrency(primitive.denom);
			if (!currency) {
				throw new Error('Unknown currency');
			}

			return new CoinPretty(currency, primitive.amount);
		});

		return {
			tokenOuts,
		};
	}

	static estimateMultihopSwapExactAmountIn(
		tokenIn: { currency: Currency; amount: string },
		routes: {
			pool: QueriedPoolBase;
			tokenOutCurrency: Currency;
		}[]
	): {
		tokenOut: CoinPretty;
		spotPriceBeforeRaw: Dec;
		spotPriceBefore: IntPretty;
		spotPriceAfter: IntPretty;
		slippage: IntPretty;
	} {
		if (routes.length === 0) {
			throw new Error('Empty route');
		}

		let spotPriceBeforeRaw = new Dec(1);
		let spotPriceBefore = new IntPretty(new Dec(1));
		let spotPriceAfter = new IntPretty(new Dec(1));

		const originalTokenIn = { ...tokenIn };

		for (const route of routes) {
			const estimated = route.pool.estimateSwapExactAmountIn(tokenIn, route.tokenOutCurrency);

			spotPriceBeforeRaw = spotPriceBeforeRaw.mul(estimated.raw.spotPriceBefore);
			spotPriceBefore = spotPriceBefore
				.mul(estimated.spotPriceBefore)
				.quo(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals - route.tokenOutCurrency.coinDecimals));
			spotPriceAfter = spotPriceAfter
				.mul(estimated.spotPriceAfter)
				.quo(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals - route.tokenOutCurrency.coinDecimals));

			// Token out should be the token in for the next route
			tokenIn = {
				currency: route.tokenOutCurrency,
				amount: estimated.tokenOut
					.locale(false)
					.hideDenom(true)
					.toString(),
			};
		}

		const effectivePrice = new Dec(originalTokenIn.amount).quo(new Dec(tokenIn.amount));
		const slippage = effectivePrice.quo(spotPriceBefore.toDec()).sub(new Dec('1'));

		return {
			spotPriceBeforeRaw,
			spotPriceBefore,
			spotPriceAfter,
			tokenOut: new CoinPretty(
				tokenIn.currency,
				new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
			),
			slippage: new IntPretty(slippage)
				.decreasePrecision(2)
				.maxDecimals(4)
				.trim(true),
		};
	}

	estimateSwapExactAmountIn(
		tokenIn: { currency: Currency; amount: string },
		tokenOutCurrency: Currency
	): {
		tokenOut: CoinPretty;
		spotPriceBefore: IntPretty;
		spotPriceAfter: IntPretty;
		slippage: IntPretty;
		raw: ReturnType<GAMMPool['estimateSwapExactAmountIn']>;
	} {
		const amount = new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

		const estimated = this.pool.estimateSwapExactAmountIn(coin, tokenOutCurrency.coinMinimalDenom);

		const tokenOut = new CoinPretty(tokenOutCurrency, estimated.tokenOutAmount);
		const spotPriceBefore = new IntPretty(estimated.spotPriceBefore).maxDecimals(4).trim(true);
		const spotPriceAfter = new IntPretty(estimated.spotPriceAfter).maxDecimals(4).trim(true);

		const slippage = new IntPretty(estimated.slippage)
			.decreasePrecision(2)
			.maxDecimals(4)
			.trim(true);

		return {
			tokenOut,
			spotPriceBefore,
			spotPriceAfter,
			slippage,
			raw: estimated,
		};
	}

	estimateSwapExactAmountOut(
		tokenInCurrency: Currency,
		tokenOut: { currency: Currency; amount: string }
	): {
		tokenIn: CoinPretty;
		spotPriceBefore: IntPretty;
		spotPriceAfter: IntPretty;
		slippage: IntPretty;
		raw: ReturnType<GAMMPool['estimateSwapExactAmountOut']>;
	} {
		const amount = new Dec(tokenOut.amount).mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenOut.currency.coinMinimalDenom, amount);

		const estimated = this.pool.estimateSwapExactAmountOut(tokenInCurrency.coinMinimalDenom, coin);

		const tokenIn = new CoinPretty(tokenInCurrency, estimated.tokenInAmount);
		const spotPriceBefore = new IntPretty(estimated.spotPriceBefore).maxDecimals(4).trim(true);
		const spotPriceAfter = new IntPretty(estimated.spotPriceAfter).maxDecimals(4).trim(true);

		const slippage = new IntPretty(estimated.slippage)
			.decreasePrecision(2)
			.maxDecimals(4)
			.trim(true);

		return {
			tokenIn,
			spotPriceBefore,
			spotPriceAfter,
			slippage,
			raw: estimated,
		};
	}

	static makeMultihopSwapExactAmountInMsg(
		msgOpt: Pick<MsgOpt, 'type'>,
		sender: string,
		tokenIn: { currency: Currency; amount: string },
		routes: {
			pool: QueriedPoolBase;
			tokenOutCurrency: Currency;
		}[],
		maxSlippage: string = '0'
	) {
		const estimated = QueriedPoolBase.estimateMultihopSwapExactAmountIn(tokenIn, routes);
		const maxSlippageDec = new Dec(maxSlippage).quo(DecUtils.getPrecisionDec(2));
		// TODO: Compare the computed slippage and wanted max slippage?

		const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
			? new Int(1)
			: GAMMPool.calculateSlippageTokenIn(
					estimated.spotPriceBeforeRaw,
					new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate(),
					maxSlippageDec
			  );

		const amount = new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

		return {
			type: msgOpt.type,
			value: {
				sender,
				routes: routes.map(route => {
					return {
						poolId: route.pool.id,
						tokenOutDenom: route.tokenOutCurrency.coinMinimalDenom,
					};
				}),
				tokenIn: {
					denom: coin.denom,
					amount: coin.amount.toString(),
				},
				tokenOutMinAmount: tokenOutMinAmount.toString(),
			},
		};
	}

	makeSwapExactAmountInMsg(
		msgOpt: Pick<MsgOpt, 'type'>,
		sender: string,
		tokenIn: { currency: Currency; amount: string },
		tokenOutCurrency: Currency,
		maxSlippage: string = '0'
	): Msg {
		const estimated = this.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);
		const maxSlippageDec = new Dec(maxSlippage).quo(DecUtils.getPrecisionDec(2));
		// TODO: Compare the computed slippage and wanted max slippage?

		const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
			? new Int(1)
			: GAMMPool.calculateSlippageTokenIn(
					estimated.raw.spotPriceBefore,
					new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate(),
					maxSlippageDec
			  );

		const amount = new Dec(tokenIn.amount).mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

		return {
			type: msgOpt.type,
			value: {
				sender,
				routes: [
					{
						poolId: this.id,
						tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
					},
				],
				tokenIn: {
					denom: coin.denom,
					amount: coin.amount.toString(),
				},
				tokenOutMinAmount: tokenOutMinAmount.toString(),
			},
		};
	}

	makeSwapExactAmountOutMsg(
		msgOpt: Pick<MsgOpt, 'type'>,
		sender: string,
		tokenInCurrency: Currency,
		tokenOut: { currency: Currency; amount: string },
		maxSlippage: string = '0'
	): Msg {
		const estimated = this.estimateSwapExactAmountOut(tokenInCurrency, tokenOut);

		const maxSlippageDec = new Dec(maxSlippage).quo(DecUtils.getPrecisionDec(2));
		// TODO: Compare the computed slippage and wanted max slippage?

		const tokenInMaxAmount = maxSlippageDec.equals(new Dec(0))
			? // TODO: Set exact 2^128 - 1
			  new Int(1000000000000)
			: GAMMPool.calculateSlippageTokenOut(
					estimated.raw.spotPriceBefore,
					new Dec(tokenOut.amount).mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals)).truncate(),
					maxSlippageDec
			  );

		const amount = new Dec(tokenOut.amount).mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals)).truncate();
		const coin = new Coin(tokenOut.currency.coinMinimalDenom, amount);

		return {
			type: msgOpt.type,
			value: {
				sender,
				routes: [
					{
						poolId: this.id,
						tokenInDenom: tokenInCurrency.coinMinimalDenom,
					},
				],
				tokenOut: {
					denom: coin.denom,
					amount: coin.amount.toString(),
				},
				tokenInMaxAmount: tokenInMaxAmount.toString(),
			},
		};
	}

	@computed
	get swapFee(): IntPretty {
		return new IntPretty(this.pool.swapFee)
			.decreasePrecision(2)
			.maxDecimals(4)
			.trim(true);
	}

	@computed
	get exitFee(): IntPretty {
		return new IntPretty(this.pool.exitFee)
			.decreasePrecision(2)
			.maxDecimals(4)
			.trim(true);
	}

	@computed
	get totalWeight(): IntPretty {
		return new IntPretty(this.pool.totalWeight);
	}

	@computed
	get totalShare(): IntPretty {
		// 쉐어의 decimal은 18으로 고정되어 있다
		return new IntPretty(this.pool.totalShare).moveDecimalPointLeft(18);
	}

	@computed
	get poolRatios(): {
		ratio: IntPretty;
		amount: CoinPretty;
	}[] {
		const result: {
			ratio: IntPretty;
			amount: CoinPretty;
		}[] = [];

		for (const poolAsset of this.poolAssets) {
			const ratio = new IntPretty(
				poolAsset.weight
					.toDec()
					.quo(this.totalWeight.toDec())
					.mul(DecUtils.getPrecisionDec(2))
			)
				.maxDecimals(2)
				.trim(true);

			result.push({
				ratio,
				amount: poolAsset.amount,
			});
		}

		return result;
	}

	@computed
	get poolAssets(): {
		weight: IntPretty;
		amount: CoinPretty;
	}[] {
		const primitives = this.pool.poolAssets;

		return primitives.map(primitive => {
			const coinPrimitive = primitive.token;
			// TODO: 실수로 `forceFindCurrency` 메소드를 타입에 안 넣어버림 ㅋ
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const currency = this.chainGetter.getChain(this.chainId).forceFindCurrency(coinPrimitive.denom);

			return {
				weight: new IntPretty(new Int(primitive.weight)),
				amount: new CoinPretty(currency, new Int(coinPrimitive.amount)),
			};
		});
	}

	/**
	 * Compute the total value locked in the pool.
	 * Only handle the known currencies that have the coingecko id.
	 * Other currencies would be ignored.
	 */
	readonly computeTotalValueLocked = computedFn(
		(
			priceStore: { calculatePrice(coin: CoinPretty, vsCurrrency?: string): PricePretty | undefined },
			fiatCurrency: FiatCurrency
		): PricePretty => {
			let price = new PricePretty(fiatCurrency, new Dec(0));

			for (const poolAsset of this.poolAssets) {
				const poolPrice = priceStore.calculatePrice(poolAsset.amount, fiatCurrency.currency);
				if (poolPrice) {
					price = price.add(poolPrice);
				}
			}

			return price;
		}
	);
}
