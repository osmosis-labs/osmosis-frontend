import { GAMMPoolData } from '../../pool/types';
import { GAMMPool } from '../../pool';
import { ChainGetter, CoinPrimitive, MsgOpt } from '@keplr-wallet/stores';
import { CoinPretty, DecUtils, IntPretty, Int, Coin, Dec } from '@keplr-wallet/unit';
import { computed, makeObservable, observable } from 'mobx';
import { Currency, FiatCurrency } from '@keplr-wallet/types';
import { Msg } from '@cosmjs/launchpad';
import { PricePretty } from '@keplr-wallet/unit/build/price-pretty';
import { computedFn } from 'mobx-utils';

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

	calculateSpotPrice(inMinimalDenom: string, outMinimalDenom: string): IntPretty {
		const calculated = this.pool.calculateSpotPrice(inMinimalDenom, outMinimalDenom);
		return new IntPretty(calculated).maxDecimals(4).trim(true);
	}

	calculateSpotPriceWithoutSwapFee(inMinimalDenom: string, outMinimalDenom: string): IntPretty {
		const calculated = this.pool.calculateSpotPriceWithoutSwapFee(inMinimalDenom, outMinimalDenom);
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
		return new IntPretty(this.pool.totalShare).precision(18);
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
			priceStore: { calculatePrice(vsCurrrency: string, coin: CoinPretty): PricePretty | undefined },
			fiatCurrency: FiatCurrency
		): PricePretty => {
			let price = new PricePretty(fiatCurrency, new Dec(0));

			for (const poolAsset of this.poolAssets) {
				const poolPrice = priceStore.calculatePrice(fiatCurrency.currency, poolAsset.amount);
				if (poolPrice) {
					price = price.add(poolPrice);
				}
			}

			return price;
		}
	);
}
