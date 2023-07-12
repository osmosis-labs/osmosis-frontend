import { Coin, Dec, Int } from "@keplr-wallet/unit";
import { ConcentratedLiquidityMath, LiquidityDepth } from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "./errors";
import { BasePool } from "./interface";
import { Quote, RoutablePool } from "./router";

export interface ConcentratedLiquidityPoolRaw {
  "@type": string;
  address: string;
  id: string;
  current_tick_liquidity: string;
  token0: string;
  token1: string;
  current_sqrt_price: string;
  current_tick: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  spread_factor: string;
}

export type TickDepths = {
  allTicks: LiquidityDepth[];
  isMaxTicks: boolean;
};

/** There is more data associated with CL pools for quoting, so it needs to be fetched later.
 *  An instance will be maintained with the pool.
 */
export interface TickDataProvider {
  /**  */
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

/** Provides balances of tokens in pool.
 *  An instance will be maintained with the pool.
 */
export interface AmountsDataProvider {
  getPoolAmounts(
    pool: ConcentratedLiquidityPool
  ): Promise<{ token0Amount: Int; token1Amount: Int }>;
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

  get swapFee(): Dec {
    return new Dec(this.raw.spread_factor);
  }

  get exitFee(): Dec {
    return new Dec(0);
  }

  get currentTick(): Int {
    return new Int(this.raw.current_tick);
  }

  /** amountToken1/amountToken0 or token 1 per token 0 */
  get currentSqrtPrice(): Dec {
    return new Dec(this.raw.current_sqrt_price);
  }

  get currentTickLiquidity(): Dec {
    return new Dec(this.raw.current_tick_liquidity);
  }

  get currentTickLiquidityXY(): [Dec, Dec] {
    const baseAmount = this.currentTickLiquidity.quo(this.currentSqrtPrice);
    const quoteAmount = this.currentTickLiquidity.mul(this.currentSqrtPrice);
    return [baseAmount, quoteAmount];
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

  constructor(
    protected readonly raw: ConcentratedLiquidityPoolRaw,
    protected readonly tickDataProvider: TickDataProvider,
    protected readonly poolAmountsProvider: AmountsDataProvider
  ) {}

  hasPoolAsset(denom: string): boolean {
    return this.poolAssetDenoms.includes(denom);
  }

  getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenOutDenom);
  }
  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenInDenom);
  }
  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    return this.spotPrice(tokenOutDenom);
  }
  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

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
    this.validateDenoms(tokenIn.denom, tokenOutDenom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0.
     *  0 for 1 is how prices are represented in CL pool model. */
    const is0For1 = tokenIn.denom === this.raw.token0;

    /** Spot price as stored in pool model. */
    const before1Over0SpotPrice = this.spotPrice(
      is0For1 ? tokenIn.denom : tokenOutDenom
    );

    /** Fetch ticks and calculate the out amount */
    let calcResult = undefined;
    do {
      const needMoreTicks = calcResult === "no-more-ticks";
      const { allTicks, isMaxTicks } =
        await this.tickDataProvider.getTickDepthsTokenOutGivenIn(
          this,
          tokenIn,
          needMoreTicks
        );

      calcResult = ConcentratedLiquidityMath.calcOutGivenIn({
        tokenIn: new Coin(tokenIn.denom, tokenIn.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: this.currentTickLiquidity,
        inittedTicks: allTicks,
        curSqrtPrice: this.currentSqrtPrice,
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

    if (amountOut.lte(new Int(0))) throw new NotEnoughLiquidityError();

    /** final price token1/token0 */
    const after1Over0SpotPrice = this.spotPrice(
      is0For1 ? tokenIn.denom : tokenOutDenom,
      afterSqrtPrice
    );

    if (is0For1 && after1Over0SpotPrice.gt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be increased after swap when swapping token 0 for 1"
      );
    } else if (!is0For1 && after1Over0SpotPrice.lt(before1Over0SpotPrice)) {
      throw new Error(
        "Spot price can't be decreased after swap when swapping token 1 for 0"
      );
    }

    const effectivePriceInOverOut = new Dec(tokenIn.amount).quoTruncate(
      new Dec(amountOut)
    );

    const beforeSpotPriceInOverOut = is0For1
      ? new Dec(1).quoTruncate(before1Over0SpotPrice)
      : before1Over0SpotPrice;
    const afterSpotPriceInOverOut = is0For1
      ? new Dec(1).quoTruncate(after1Over0SpotPrice)
      : after1Over0SpotPrice;

    const priceImpactTokenOut = effectivePriceInOverOut
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec(1));

    // HACK: @jonator - getting a div by zero in some cases. Letting you deal with a proper solution to this.
    const invertIfNonZero = (toInvert: Dec) =>
      toInvert.lte(new Dec(0)) ? new Dec(1) : new Dec(1).quoTruncate(toInvert);

    return {
      amount: amountOut,
      beforeSpotPriceInOverOut: beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: invertIfNonZero(beforeSpotPriceInOverOut),
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: invertIfNonZero(afterSpotPriceInOverOut),
      effectivePriceInOverOut,
      effectivePriceOutOverIn: invertIfNonZero(effectivePriceInOverOut),
      priceImpactTokenOut,
      numTicksCrossed: calcResult.numTicksCrossed,
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
    this.validateDenoms(tokenInDenom, tokenOut.denom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0.
     *  0 for 1 is how prices are represented in CL pool model. */
    const is0For1 = tokenInDenom === this.raw.token0;

    /** Spot price as stored in pool model.
     *  reminder: the token being swapped, even though the token out is the amount specified */
    const before1Over0SpotPrice = this.spotPrice(
      is0For1 ? tokenInDenom : tokenOut.denom
    );

    let calcResult = undefined;
    do {
      const needMoreTicks = calcResult === "no-more-ticks";
      const { allTicks: inittedTicks, isMaxTicks } =
        await this.tickDataProvider.getTickDepthsTokenInGivenOut(
          this,
          tokenOut,
          needMoreTicks
        );

      calcResult = ConcentratedLiquidityMath.calcInGivenOut({
        tokenOut: new Coin(tokenOut.denom, tokenOut.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: this.currentTickLiquidity,
        inittedTicks,
        curSqrtPrice: this.currentSqrtPrice,
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

    if (amountIn.lte(new Int(0))) throw new NotEnoughLiquidityError();

    /** final price token1/token0 */
    const after1Over0SpotPrice = this.spotPrice(
      is0For1 ? tokenInDenom : tokenOut.denom,
      afterSqrtPrice
    );

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
      ? new Dec(1).quoTruncate(before1Over0SpotPrice)
      : before1Over0SpotPrice;
    const afterSpotPriceInOverOut = is0For1
      ? new Dec(1).quoTruncate(after1Over0SpotPrice)
      : after1Over0SpotPrice;

    const effectivePriceInOverOut = new Dec(amountIn).quoTruncate(
      new Dec(tokenOut.amount)
    );

    const priceImpactTokenOut = effectivePriceInOverOut
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec(1));

    return {
      amount: amountIn,
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        beforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePriceInOverOut),
      priceImpactTokenOut,
      numTicksCrossed: calcResult.numTicksCrossed,
    };
  }

  async getLimitAmountByTokenIn(denom: string): Promise<Int> {
    const { token0Amount, token1Amount } =
      await this.poolAmountsProvider.getPoolAmounts(this);

    if (denom === this.raw.token0) {
      return token0Amount;
    } else {
      return token1Amount;
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

  protected validateDenoms(...tokenDenoms: string[]): void {
    const uniqueSet = new Set(tokenDenoms);
    if (uniqueSet.size !== tokenDenoms.length) {
      throw new Error(`Duplicate denoms`);
    }

    if (!tokenDenoms.every((denom) => this.hasPoolAsset(denom))) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${tokenDenoms.join(
          ", "
        )}`
      );
    }
  }
}
