import { Dec, Int } from "@keplr-wallet/unit";

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

// TODO: import this type from osmosis-labs/math package
export type LiquidityDepth = {
  tickIndex: Int;
  netLiquidity: Int;
};

export class ConcentratedLiquidityPool implements BasePool, RoutablePool {
  protected _token0Amount = new Int(0);
  set token0Amount(amount: Int) {
    this._token0Amount = amount;
  }
  protected _token1Amount = new Int(0);
  set token1Amount(amount: Int) {
    this._token1Amount = amount;
  }

  protected _liquidityDepths: LiquidityDepth[] = [];
  set liquidityDepths(liquidityDepths: LiquidityDepth[]) {
    this._liquidityDepths = liquidityDepths;
  }

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

  get swapFee(): Dec {
    return new Dec(this.raw.swap_fee);
  }
  get exitFee(): Dec {
    return new Dec(0);
  }

  constructor(public readonly raw: ConcentratedLiquidityPoolRaw) {}

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
    if (tokenInDenom !== this.raw.token0 && tokenOutDenom !== this.raw.token1) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${tokenInDenom} and ${tokenOutDenom}`
      );
    }

    throw new Error("Method not implemented.");
  }
  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    throw new Error("Method not implemented.");
  }
  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    throw new Error("Method not implemented.");
  }
  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    throw new Error("Method not implemented.");
  }

  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string
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

    throw new Error("Method not implemented.");
  }
  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string
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

    throw new Error("Method not implemented.");
  }

  getNormalizedLiquidity(tokenInDenom: string, tokenOutDenom: string): Dec {
    this.validateDenoms(tokenInDenom, tokenOutDenom);

    throw new Error("Method not implemented.");
  }
  getLimitAmountByTokenIn(denom: string): Int {
    this.validateDenoms(denom);

    throw new Error("Method not implemented.");
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
