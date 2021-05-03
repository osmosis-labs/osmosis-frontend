import { GAMMPoolData } from './types';
import { Coin, Dec, Int } from '@keplr-wallet/unit';
import * as Math from './math';

export class GAMMPool {
	static calculateSlippageTokenIn(spotPriceBefore: Dec, tokenIn: Int, slippage: Dec): Int {
		const effectivePrice = spotPriceBefore.mul(slippage.add(new Dec(1)));
		return new Dec(tokenIn).quo(effectivePrice).truncate();
	}

	static calculateSlippageTokenOut(spotPriceBefore: Dec, tokenOut: Int, slippage: Dec): Int {
		const effectivePrice = spotPriceBefore.mul(slippage.add(new Dec(1)));
		return new Dec(tokenOut).mul(effectivePrice).truncate();
	}

	constructor(protected readonly data: GAMMPoolData) {}

	get id(): string {
		return this.data.id;
	}

	get totalWeight(): Int {
		return new Int(this.data.totalWeight);
	}

	get shareDenom(): string {
		return this.data.totalShare.denom;
	}

	get swapFee(): Dec {
		return new Dec(this.data.poolParams.swapFee);
	}

	get totalShare(): Int {
		return new Int(this.data.totalShare.amount);
	}

	get poolAssets(): GAMMPoolData['poolAssets'] {
		return this.data.poolAssets;
	}

	estimateJoinPool(
		shareOutAmount: Int
	): {
		tokenIns: Coin[];
	} {
		const tokenIns: Coin[] = [];

		const totalShare = this.totalShare;
		const shareRatio = new Dec(shareOutAmount).quo(new Dec(totalShare));
		if (shareRatio.lte(new Dec(0))) {
			throw new Error('share ratio is zero or negative');
		}

		for (const poolAsset of this.data.poolAssets) {
			const tokenInAmount = shareRatio.mul(new Dec(poolAsset.token.amount)).truncate();

			tokenIns.push(new Coin(poolAsset.token.denom, tokenInAmount));
		}

		return {
			tokenIns,
		};
	}

	estimateSwapExactAmountIn(
		tokenIn: Coin,
		tokenOutDenom: string
	): {
		tokenOutAmount: Int;
		spotPriceBefore: Dec;
		spotPriceAfter: Dec;
		slippage: Dec;
	} {
		const inPoolAsset = this.getPoolAsset(tokenIn.denom);
		const outPoolAsset = this.getPoolAsset(tokenOutDenom);

		const spotPriceBefore = Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			this.swapFee
		);

		const tokenOutAmount = Math.calcOutGivenIn(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			new Dec(tokenIn.amount),
			this.swapFee
		).truncate();

		const spotPriceAfter = Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount).add(new Dec(tokenIn.amount)),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount).sub(new Dec(tokenOutAmount)),
			new Dec(outPoolAsset.weight),
			this.swapFee
		);
		if (spotPriceAfter.lt(spotPriceBefore)) {
			throw new Error("spot price can't be decreased after swap");
		}

		const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
		const slippage = effectivePrice.quo(spotPriceBefore).sub(new Dec('1'));

		return {
			tokenOutAmount,
			spotPriceBefore,
			spotPriceAfter,
			slippage,
		};
	}

	estimateSwapExactAmountOut(
		tokenInDenom: string,
		tokenOut: Coin
	): {
		tokenInAmount: Int;
		spotPriceBefore: Dec;
		spotPriceAfter: Dec;
		slippage: Dec;
	} {
		const inPoolAsset = this.getPoolAsset(tokenInDenom);
		const outPoolAsset = this.getPoolAsset(tokenOut.denom);

		const spotPriceBefore = Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			this.swapFee
		);

		const tokenInAmount = Math.calcInGivenOut(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			new Dec(tokenOut.amount),
			this.swapFee
		).truncate();

		const spotPriceAfter = Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount).add(new Dec(tokenInAmount)),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount).sub(new Dec(tokenOut.amount)),
			new Dec(outPoolAsset.weight),
			this.swapFee
		);

		if (spotPriceAfter.lt(spotPriceBefore)) {
			throw new Error("spot price can't be decreased after swap");
		}

		const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
		const slippage = effectivePrice.quo(spotPriceBefore).sub(new Dec('1'));

		return {
			tokenInAmount,
			spotPriceBefore,
			spotPriceAfter,
			slippage,
		};
	}

	calculateSpotPrice(inDenom: string, outDenom: string): Dec {
		const inPoolAsset = this.getPoolAsset(inDenom);
		const outPoolAsset = this.getPoolAsset(outDenom);

		return Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			new Dec(this.data.poolParams.swapFee)
		);
	}

	calculateSpotPriceWithoutSwapFee(inDenom: string, outDenom: string): Dec {
		const inPoolAsset = this.getPoolAsset(inDenom);
		const outPoolAsset = this.getPoolAsset(outDenom);

		return Math.calcSpotPrice(
			new Dec(inPoolAsset.token.amount),
			new Dec(inPoolAsset.weight),
			new Dec(outPoolAsset.token.amount),
			new Dec(outPoolAsset.weight),
			new Dec(0)
		);
	}

	getPoolAsset(denom: string): GAMMPoolData['poolAssets'][0] {
		const poolAsset = this.data.poolAssets.find(poolAsset => {
			return poolAsset.token.denom === denom;
		});

		if (!poolAsset) {
			throw new Error(`pool doesn't have the pool asset for ${denom}`);
		}

		return poolAsset;
	}
}
