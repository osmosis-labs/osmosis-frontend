import { Coin, Dec, Int } from "@keplr-wallet/unit";
import { ConcentratedLiquidityMath, LiquidityDepth } from "@osmosis-labs/math";

import { BasePool } from "./interface";
import { RoutablePool } from "./routes";

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
  precision_factor_at_price_one: string;
  swap_fee: string;
  last_liquidity_update: string;
}

export class ConcentratedLiquidityPool implements BasePool, RoutablePool {
  // transient data to be updatable outside of instance
  protected _token0Amount = new Int(0);
  set token0Amount(amount: Int) {
    this._token0Amount = amount;
  }
  protected _token1Amount = new Int(0);
  set token1Amount(amount: Int) {
    this._token1Amount = amount;
  }

  protected _liquidityDepths0For1: LiquidityDepth[] = [];
  protected _liquidityDepths1For0: LiquidityDepth[] = [];

  protected _currentTick: Int;
  protected _currentTickLiquidity: Dec;
  // end transient data

  get type(): "concentrated" {
    return "concentrated";
  }

  get id() {
    return this.raw.id;
  }

  get address() {
    return this.raw.address;
  }

  get poolAssets(): { denom: string; amount: Int }[] {
    return [
      {
        denom: this.raw.token0,
        amount: this._token0Amount,
      },
      {
        denom: this.raw.token1,
        amount: this._token1Amount,
      },
    ];
  }

  get poolAssetDenoms() {
    return [this.raw.token0, this.raw.token1];
  }

  get swapFee(): Dec {
    return new Dec(this.raw.swap_fee);
  }
  get exitFee(): Dec {
    return new Dec(0);
  }

  get currentTick(): Int {
    return this._currentTick;
  }

  set currentTick(tick: Int) {
    this._currentTick = tick;
  }

  /** amountToken1/amountToken0 or token 1 per token 0 */
  get currentSqrtPrice(): Dec {
    return new Dec(this.raw.current_sqrt_price);
  }

  get currentTickLiquidity(): Dec {
    return this._currentTickLiquidity;
  }

  set currentTickLiquidity(liquidity: Dec) {
    this._currentTickLiquidity = liquidity;
  }

  get tickSpacing(): number {
    const ts = parseInt(this.raw.tick_spacing);
    if (isNaN(ts)) {
      throw new Error(`Invalid tick spacing in pool id: ${this.raw.id}`);
    }
    return ts;
  }

  get precisionFactorAtPriceOne(): number {
    const pf = parseInt(this.raw.precision_factor_at_price_one);
    if (isNaN(pf)) {
      throw new Error(
        `Invalid precision factor at price one in pool id: ${this.raw.id}`
      );
    }
    return pf;
  }

  constructor(public readonly raw: ConcentratedLiquidityPoolRaw) {
    this._currentTick = new Int(raw.current_tick);
    this._currentTickLiquidity = new Dec(raw.current_tick_liquidity);
  }

  setLiquidityDepths(tokenInDenom: string, depths: LiquidityDepth[]) {
    if (tokenInDenom === this.raw.token0) {
      this._liquidityDepths0For1 = depths;
    } else {
      this._liquidityDepths1For0 = depths;
    }
  }

  getPoolAsset(denom: string): { denom: string; amount: Int } {
    const poolAsset = this.poolAssets.find((asset) => asset.denom === denom);
    if (!poolAsset) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${denom}`
      );
    }

    return poolAsset;
  }

  hasPoolAsset(denom: string): boolean {
    return this.poolAssets.some((asset) => asset.denom === denom);
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

  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    swapFee: Dec = this.swapFee
  ): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    priceImpact: Dec;
  } {
    this.validateDenoms(tokenIn.denom, tokenOutDenom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0  */
    const isTokenInSpotPriceDenominator = tokenIn.denom === this.raw.token0;

    const beforeSpotPriceInOverOut = isTokenInSpotPriceDenominator
      ? this.getSpotPriceOutOverIn(tokenIn.denom, tokenOutDenom)
      : this.getSpotPriceInOverOut(tokenIn.denom, tokenOutDenom);

    const inittedTicks =
      tokenIn.denom === this.raw.token0
        ? this._liquidityDepths0For1
        : this._liquidityDepths1For0;

    const { amountOut, afterSqrtPrice } =
      ConcentratedLiquidityMath.calcOutGivenIn({
        tokenIn: new Coin(tokenIn.denom, tokenIn.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: this.currentTickLiquidity,
        inittedTicks,
        curSqrtPrice: this.currentSqrtPrice,
        precisionFactorAtPriceOne: this.precisionFactorAtPriceOne,
        swapFee,
      });

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
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    swapFee: Dec = this.swapFee
  ): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    priceImpact: Dec;
  } {
    this.validateDenoms(tokenInDenom, tokenOut.denom);

    /** Reminder: currentSqrtPrice: amountToken1/amountToken0 or token 1 per token 0  */
    const isTokenInSpotPriceDenominator = tokenOut.denom === this.raw.token0;

    const beforeSpotPriceInOverOut = isTokenInSpotPriceDenominator
      ? this.getSpotPriceOutOverIn(tokenInDenom, tokenOut.denom)
      : this.getSpotPriceInOverOut(tokenInDenom, tokenOut.denom);

    const inittedTicks =
      tokenInDenom === this.raw.token0
        ? this._liquidityDepths0For1
        : this._liquidityDepths1For0;

    const { amountIn, afterSqrtPrice } =
      ConcentratedLiquidityMath.calcInGivenOut({
        tokenOut: new Coin(tokenOut.denom, tokenOut.amount),
        tokenDenom0: this.raw.token0,
        poolLiquidity: this.currentTickLiquidity,
        inittedTicks,
        curSqrtPrice: this.currentSqrtPrice,
        precisionFactorAtPriceOne: this.precisionFactorAtPriceOne,
        swapFee,
      });

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

  getNormalizedLiquidity(tokenInDenom: string, tokenOutDenom: string): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);
    const tokenOut = this.getPoolAsset(tokenOutDenom);

    return tokenOut.amount.toDec();
  }
  getLimitAmountByTokenIn(denom: string): Int {
    this.validateDenoms(denom);

    if (denom === this.raw.token0) {
      return this._token0Amount;
    } else {
      return this._token1Amount;
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
