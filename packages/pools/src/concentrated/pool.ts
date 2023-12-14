import { Coin, Dec, Int } from "@keplr-wallet/unit";
import {
  BigDec,
  ConcentratedLiquidityMath,
  LiquidityDepth,
} from "@osmosis-labs/math";

import {
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
  validateDenoms,
} from "../errors";
import { BasePool } from "../interface";
import { Quote, RoutablePool } from "../router";
import { PoolCommon, PoolMetricsRaw } from "../types";

export type ConcentratedLiquidityPoolRaw = PoolCommon &
  Partial<PoolMetricsRaw> & {
    "@type": string;
    address: string;
    id: string;
    current_tick_liquidity: string;
    token0: string;
    token1: string;
    token0Amount: string;
    token1Amount: string;
    current_sqrt_price: string;
    current_tick: string;
    tick_spacing: string;
    exponent_at_price_one: string;
    spread_factor: string;
  };

export type TickDepths = {
  currentLiquidity: Dec;
  currentSqrtPrice: BigDec;
  currentTick: Int;
  allTicks: LiquidityDepth[];
  isMaxTicks: boolean;
};

/** There is more data associated with CL pools for quoting, so it needs to be fetched later.
 *  An instance will be maintained with the pool.
 */
export interface TickDataProvider {
  getTickDepthsTokenOutGivenIn(
    pool: ConcentratedLiquidityPool,
    token: {
      denom: string;
      amount: Int;
    },
    getMoreTicks?: boolean
  ): Promise<TickDepths>;
  getTickDepthsTokenInGivenOut(
    pool: ConcentratedLiquidityPool,
    token: {
      denom: string;
      amount: Int;
    },
    getMoreTicks?: boolean
  ): Promise<TickDepths>;
}

export class ConcentratedLiquidityPool implements BasePool, RoutablePool {
  get type(): "concentrated" {
    return "concentrated";
  }

  get id() {
    return this.raw.id;
  }

  get address() {
    return this.raw.address;
  }

  get poolAssetDenoms() {
    return [this.raw.token0, this.raw.token1];
  }

  get token0() {
    return this.raw.token0;
  }

  get token1() {
    return this.raw.token1;
  }

  get token0Amount() {
    return new Int(this.raw.token0Amount);
  }

  get token1Amount() {
    return new Int(this.raw.token1Amount);
  }

  get swapFee(): Dec {
    return new Dec(this.raw.spread_factor);
  }

  get exitFee(): Dec {
    return new Dec(0);
  }

  get poolAssets() {
    return [
      {
        denom: this.raw.token0,
        amount: this.token0Amount,
      },
      {
        denom: this.raw.token1,
        amount: this.token1Amount,
      },
    ];
  }

  /** amountToken1/amountToken0 or token 1 per token 0 */
  get currentSqrtPrice(): BigDec {
    return new BigDec(this.raw.current_sqrt_price);
  }

  get currentTickLiquidity(): Dec {
    return new Dec(this.raw.current_tick_liquidity);
  }

  get tickSpacing(): number {
    const ts = parseInt(this.raw.tick_spacing);
    if (isNaN(ts)) {
      throw new Error(
        `Invalid tick spacing in pool id: ${this.raw.id}, tick spacing: ${this.raw.tick_spacing}`
      );
    }
    return ts;
  }

  get exponentAtPriceOne(): number {
    const pf = parseInt(this.raw.exponent_at_price_one);
    if (isNaN(pf)) {
      throw new Error(
        `Invalid exponent at price one in pool id: ${this.raw.id}, factor: ${this.raw.exponent_at_price_one}`
      );
    }
    return pf;
  }

  get takerFee(): Dec {
    return new Dec(this.raw.taker_fee);
  }

  constructor(
    readonly raw: ConcentratedLiquidityPoolRaw,
    protected readonly tickDataProvider?: TickDataProvider
  ) {}

  hasPoolAsset(denom: string): boolean {
    return this.poolAssetDenoms.includes(denom);
  }

  getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenOutDenom);
  }
  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenInDenom);
  }
  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenOutDenom);
  }
  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenInDenom);
  }

  async getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    swapFee: Dec = this.swapFee
  ): Promise<Quote> {
    validateDenoms(this, tokenIn.denom, tokenOutDenom);
    if (!this.tickDataProvider) throw new Error("TickDataProvider is not set");

    tokenIn.amount = new Dec(tokenIn.amount)
      .mul(new Dec(1).sub(this.takerFee))
      .truncate();

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0.
     *  0 for 1 is how prices are represented in CL pool model. */
    const is0For1 = tokenIn.denom === this.raw.token0;

    let before1Over0SpotPrice: BigDec | undefined;

    /** Fetch ticks and calculate the out amount */
    let calcResult = undefined;
    do {
      const needMoreTicks = calcResult === "no-more-ticks";
      // once exposed on chain
      const { allTicks, isMaxTicks, currentSqrtPrice, currentLiquidity } =
        await this.tickDataProvider.getTickDepthsTokenOutGivenIn(
          this,
          tokenIn,
          needMoreTicks
        );

      if (!before1Over0SpotPrice)
        before1Over0SpotPrice = currentSqrtPrice.pow(new Int(2));

      calcResult = ConcentratedLiquidityMath.calcOutGivenIn({
        tokenIn: new Coin(tokenIn.denom, tokenIn.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: currentLiquidity,
        inittedTicks: allTicks,
        curSqrtPrice: currentSqrtPrice,
        swapFee,
      });

      // handle not enough ticks
      if (calcResult === "no-more-ticks" && isMaxTicks) {
        throw new NotEnoughLiquidityError(
          `Pool ${
            this.id
          } has not enough ticks (liquidity) to swap ${tokenIn.amount.toString()} ${
            tokenIn.denom
          } to ${tokenOutDenom})`
        );
      }
    } while (calcResult === "no-more-ticks");

    const { amountOut, afterSqrtPrice } = calcResult;

    if (amountOut.lte(new Int(0)))
      throw new NotEnoughQuotedError(
        `The calculated amount of token ${tokenOutDenom} out is smaller than 1 when quoting ${tokenIn.amount}${tokenIn.denom} in.`
      );

    /** final price token1/token0 */
    const after1Over0SpotPrice = afterSqrtPrice.pow(new Int(2));

    if (is0For1 && after1Over0SpotPrice.gt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be increased after swap when swapping token 0 for 1"
      );
    } else if (!is0For1 && after1Over0SpotPrice.lt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be decreased after swap when swapping token 1 for 0"
      );
    }

    const effectivePriceInOverOut = new BigDec(tokenIn.amount).quoTruncate(
      new BigDec(amountOut)
    );

    const beforeSpotPriceInOverOut = is0For1
      ? new BigDec(1).quoTruncate(before1Over0SpotPrice)
      : before1Over0SpotPrice;
    const afterSpotPriceInOverOut = is0For1
      ? new BigDec(1).quoTruncate(after1Over0SpotPrice)
      : after1Over0SpotPrice;

    const priceImpactTokenOut = effectivePriceInOverOut
      .quo(beforeSpotPriceInOverOut)
      .sub(new BigDec(1));

    // HACK: @jonator - getting a div by zero in some cases. Letting you deal with a proper solution to this.
    const invertIfNonZero = (toInvert: BigDec) =>
      toInvert.lte(new BigDec(0))
        ? new BigDec(1)
        : new BigDec(1).quoTruncate(toInvert);

    return {
      amount: amountOut,
      beforeSpotPriceInOverOut: beforeSpotPriceInOverOut.toDec(),
      beforeSpotPriceOutOverIn: invertIfNonZero(
        beforeSpotPriceInOverOut
      ).toDec(),
      afterSpotPriceInOverOut: afterSpotPriceInOverOut.toDec(),
      afterSpotPriceOutOverIn: invertIfNonZero(afterSpotPriceInOverOut).toDec(),
      effectivePriceInOverOut: effectivePriceInOverOut.toDec(),
      effectivePriceOutOverIn: invertIfNonZero(effectivePriceInOverOut).toDec(),
      priceImpactTokenOut: priceImpactTokenOut.toDec(),
    };
  }

  async getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee: Dec = this.swapFee
  ): Promise<Quote> {
    validateDenoms(this, tokenInDenom, tokenOut.denom);
    if (!this.tickDataProvider) throw new Error("TickDataProvider is not set");

    tokenOut.amount = new Dec(tokenOut.amount)
      .mul(new Dec(1).sub(this.takerFee))
      .truncate();

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0.
     *  0 for 1 is how prices are represented in CL pool model. */
    const is0For1 = tokenInDenom === this.raw.token0;

    /** reminder: the token being swapped, even though the token out is the amount specified */
    let before1Over0SpotPrice: BigDec | undefined;

    let calcResult = undefined;
    do {
      const needMoreTicks = calcResult === "no-more-ticks";
      const { allTicks, isMaxTicks, currentSqrtPrice, currentLiquidity } =
        await this.tickDataProvider.getTickDepthsTokenInGivenOut(
          this,
          tokenOut,
          needMoreTicks
        );

      if (!before1Over0SpotPrice)
        before1Over0SpotPrice = currentSqrtPrice.pow(new Int(2));

      calcResult = ConcentratedLiquidityMath.calcInGivenOut({
        tokenOut: new Coin(tokenOut.denom, tokenOut.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: currentLiquidity,
        inittedTicks: allTicks,
        curSqrtPrice: currentSqrtPrice,
        swapFee,
      });

      // handle not enough ticks
      if (calcResult === "no-more-ticks" && isMaxTicks) {
        throw new NotEnoughLiquidityError(
          `Pool ${
            this.id
          } has not enough ticks (liquidity) to swap ${tokenOut.amount.toString()} ${
            tokenOut.denom
          } to ${tokenInDenom})`
        );
      }
    } while (calcResult === "no-more-ticks");

    const { amountIn, afterSqrtPrice } = calcResult;

    if (amountIn.lte(new Int(0)))
      throw new NotEnoughQuotedError(
        `The calculated amount of token ${tokenInDenom} in is smaller than 1 when quoting ${tokenOut.amount}${tokenOut.denom} out.`
      );

    /** final price token1/token0 */
    const after1Over0SpotPrice = afterSqrtPrice.pow(new Int(2));

    if (is0For1 && after1Over0SpotPrice.gt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be increased after swap when swapping token 0 for 1"
      );
    } else if (!is0For1 && after1Over0SpotPrice.lt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be decreased after swap when swapping token 1 for 0"
      );
    }

    const beforeSpotPriceInOverOut = is0For1
      ? new BigDec(1).quoTruncate(before1Over0SpotPrice)
      : before1Over0SpotPrice;
    const afterSpotPriceInOverOut = is0For1
      ? new BigDec(1).quoTruncate(after1Over0SpotPrice)
      : after1Over0SpotPrice;

    const effectivePriceInOverOut = new BigDec(amountIn).quoTruncate(
      new BigDec(tokenOut.amount)
    );

    const priceImpactTokenOut = effectivePriceInOverOut
      .quo(beforeSpotPriceInOverOut)
      .sub(new BigDec(1));

    return {
      amount: amountIn,
      beforeSpotPriceInOverOut: before1Over0SpotPrice.toDec(),
      beforeSpotPriceOutOverIn: new BigDec(1)
        .quoTruncate(beforeSpotPriceInOverOut)
        .toDec(),
      afterSpotPriceInOverOut: afterSpotPriceInOverOut.toDec(),
      afterSpotPriceOutOverIn: new BigDec(1)
        .quoTruncate(afterSpotPriceInOverOut)
        .toDec(),
      effectivePriceInOverOut: effectivePriceInOverOut.toDec(),
      effectivePriceOutOverIn: new BigDec(1)
        .quoTruncate(effectivePriceInOverOut)
        .toDec(),
      priceImpactTokenOut: priceImpactTokenOut.toDec(),
    };
  }

  getLimitAmountByTokenIn(denom: string): Int {
    const { token0Amount, token1Amount } = this.raw;

    if (denom === this.raw.token0) {
      return new Int(token0Amount);
    } else {
      return new Int(token1Amount);
    }
  }

  // go SpotPrice(): https://github.com/osmosis-labs/osmosis/blob/b68141b856a806b813d86d80e89ac7a01f54a66d/x/concentrated-liquidity/model/pool.go#L106
  /** Convert a square root price to a normal price given a base asset. Defaults to pool's current square root price. */
  protected spotPrice(
    baseDenom: string,
    sqrtPriceToken1OverToken0 = new Dec(this.raw.current_sqrt_price)
  ) {
    if (baseDenom === this.raw.token0) {
      return sqrtPriceToken1OverToken0.pow(new Int(2));
    }
    return new Dec(1).quo(sqrtPriceToken1OverToken0.pow(new Int(2)));
  }
}
