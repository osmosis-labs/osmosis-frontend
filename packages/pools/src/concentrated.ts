import { Coin, Dec, Int } from "@keplr-wallet/unit";
import { ConcentratedLiquidityMath, LiquidityDepth } from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "./errors";
import { BasePool } from "./interface";
import { RoutablePool, SwapResult } from "./router";

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
  swap_fee: string;
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
    return new Dec(this.raw.swap_fee);
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
  ): Promise<SwapResult> {
    this.validateDenoms(tokenIn.denom, tokenOutDenom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0  */
    const isTokenInSpotPriceDenominator = tokenIn.denom === this.raw.token0;

    const beforeSpotPriceInOverOut = isTokenInSpotPriceDenominator
      ? this.getSpotPriceOutOverIn(tokenIn.denom, tokenOutDenom)
      : this.getSpotPriceInOverOut(tokenIn.denom, tokenOutDenom);

    /** Fetch ticks and calculate the out */
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
        precisionFactorAtPriceOne: this.exponentAtPriceOne,
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

    if (amountOut.equals(new Int(0))) {
      return {
        amount: new Int(0),
        beforeSpotPriceInOverOut: new Dec(0),
        beforeSpotPriceOutOverIn: new Dec(0),
        afterSpotPriceInOverOut: new Dec(0),
        afterSpotPriceOutOverIn: new Dec(0),
        effectivePriceInOverOut: new Dec(0),
        effectivePriceOutOverIn: new Dec(0),
        priceImpact: new Dec(0),
      };
    }

    /** final price token1/token0 */
    const afterSpotPriceInOverOut = this.spotPrice(
      isTokenInSpotPriceDenominator ? tokenIn.denom : tokenOutDenom,
      afterSqrtPrice
    );

    const effectivePriceInOverOut = new Dec(tokenIn.amount).quoTruncate(
      new Dec(amountOut)
    );

    const priceImpact = effectivePriceInOverOut
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec(1));

    return {
      amount: amountOut,
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        beforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePriceInOverOut),
      priceImpact,
    };
  }

  async getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee: Dec = this.swapFee
  ): Promise<SwapResult> {
    this.validateDenoms(tokenInDenom, tokenOut.denom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0  */
    const isTokenInSpotPriceDenominator = tokenOut.denom === this.raw.token0;

    const beforeSpotPriceInOverOut = isTokenInSpotPriceDenominator
      ? this.getSpotPriceOutOverIn(tokenInDenom, tokenOut.denom)
      : this.getSpotPriceInOverOut(tokenInDenom, tokenOut.denom);

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
        precisionFactorAtPriceOne: this.exponentAtPriceOne,
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

    if (amountIn.equals(new Int(0))) {
      return {
        amount: new Int(0),
        beforeSpotPriceInOverOut: new Dec(0),
        beforeSpotPriceOutOverIn: new Dec(0),
        afterSpotPriceInOverOut: new Dec(0),
        afterSpotPriceOutOverIn: new Dec(0),
        effectivePriceInOverOut: new Dec(0),
        effectivePriceOutOverIn: new Dec(0),
        priceImpact: new Dec(0),
      };
    }

    /** final price token1/token0 */
    const afterSpotPriceInOverOut = this.spotPrice(
      isTokenInSpotPriceDenominator ? tokenInDenom : tokenOut.denom,
      afterSqrtPrice
    );

    const effectivePriceInOverOut = new Dec(amountIn).quoTruncate(
      new Dec(tokenOut.amount)
    );

    const priceImpact = effectivePriceInOverOut
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
      priceImpact,
    };
  }

  async getLimitAmountByTokenIn(denom: string): Promise<Int> {
    this.validateDenoms(denom);

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
