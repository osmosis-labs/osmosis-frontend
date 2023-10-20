import { Coin, Dec, Int } from "@keplr-wallet/unit";
import { StableSwapMath, StableSwapToken } from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "./errors";
import { SharePool } from "./interface";
import { Quote, RoutablePool } from "./router";
import { PoolCommon, PoolMetricsRaw } from "./types";

/** Raw query response representation of pool. */
export type StablePoolRaw = PoolCommon &
  Partial<PoolMetricsRaw> & {
    "@type": string;
    id: string;
    pool_params: {
      // Dec
      swap_fee: string;
      // Dec
      exit_fee: string;
    };
    total_shares: {
      denom: string;
      // Int
      amount: string;
    };
    pool_liquidity: {
      denom: string;
      // Int
      amount: string;
    }[];
    scaling_factors: string[];
    scaling_factor_controller: string;
  };

/** Implementation of stableswap Pool interface w/ related stableswap calculations & metadata. */
export class StablePool implements SharePool, RoutablePool {
  get type(): "stable" {
    return "stable";
  }

  get id(): string {
    return this.raw.id;
  }

  get poolAssets(): { denom: string; amount: Int; scalingFactor: number }[] {
    return this.raw.pool_liquidity.map((asset, index) => {
      const scalingFactor = parseInt(this.raw.scaling_factors[index]);
      if (isNaN(scalingFactor))
        throw new Error(`Invalid scaling factor in pool id: ${this.raw.id}`);

      return {
        denom: asset.denom,
        amount: new Int(asset.amount),
        scalingFactor,
      };
    });
  }

  get poolAssetDenoms(): string[] {
    return this.raw.pool_liquidity.map((asset) => asset.denom);
  }

  get totalShare(): Int {
    return new Int(this.raw.total_shares.amount);
  }
  get shareDenom(): string {
    return this.raw.total_shares.denom;
  }

  get swapFee(): Dec {
    return new Dec(this.raw.pool_params.swap_fee);
  }
  get exitFee(): Dec {
    return new Dec(this.raw.pool_params.exit_fee);
  }
  get takerFee(): Dec {
    return new Dec(this.raw.taker_fee);
  }

  protected get stableSwapTokens(): StableSwapToken[] {
    return this.poolAssets.map((asset, index) => {
      const scalingFactor = parseInt(this.raw.scaling_factors[index]);

      if (isNaN(scalingFactor)) throw new Error("Invalid scaling factor");

      return {
        denom: asset.denom,
        amount: new Dec(asset.amount.toString()),
        scalingFactor,
      };
    });
  }

  constructor(public readonly raw: StablePoolRaw) {}

  getPoolAsset(denom: string): {
    denom: string;
    amount: Int;
    scalingFactor: number;
  } {
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
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    try {
      return StableSwapMath.calcSpotPrice(
        this.stableSwapTokens,
        inPoolAsset.denom,
        outPoolAsset.denom
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }
  }

  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    try {
      return StableSwapMath.calcSpotPrice(
        this.stableSwapTokens,
        inPoolAsset.denom,
        outPoolAsset.denom
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }
  }

  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    return new Dec(1).quoTruncate(
      this.getSpotPriceInOverOut(tokenInDenom, tokenOutDenom)
    );
  }

  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    return new Dec(1).quoTruncate(
      this.getSpotPriceInOverOutWithoutSwapFee(tokenInDenom, tokenOutDenom)
    );
  }

  async getTokenInByTokenOut(
    tokenOut: { denom: string; amount: Int },
    tokenInDenom: string,
    swapFee?: Dec
  ): Promise<Quote> {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOut.denom);

    tokenOut.amount = new Dec(tokenOut.amount)
      .mul(new Dec(1).sub(this.takerFee))
      .truncate();

    const coinOut = new Coin(tokenOut.denom, tokenOut.amount);

    let beforeSpotPriceInOverOut: Dec;
    let tokenInAmount: Int;
    try {
      beforeSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
        this.stableSwapTokens,
        inPoolAsset.denom,
        outPoolAsset.denom
      );

      tokenInAmount = StableSwapMath.calcInGivenOut(
        this.stableSwapTokens,
        coinOut,
        tokenInDenom,
        swapFee ?? this.swapFee
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }

    if (tokenInAmount.lte(new Int(0))) throw new NotEnoughLiquidityError();

    const movedStableTokens: StableSwapToken[] = this.stableSwapTokens.map(
      (token) => {
        if (token.denom === tokenInDenom) {
          return { ...token, amount: token.amount.add(new Dec(tokenInAmount)) };
        }
        if (token.denom === tokenOut.denom) {
          return {
            ...token,
            amount: token.amount.sub(new Dec(tokenOut.amount)),
          };
        }
        return token;
      }
    );

    let afterSpotPriceInOverOut;
    try {
      afterSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
        movedStableTokens,
        inPoolAsset.denom,
        outPoolAsset.denom
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }

    // Now you can use the `spotPrice` variable later in your code

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
    const priceImpactTokenOut = effectivePrice
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      amount: tokenInAmount,
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        beforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut: effectivePrice,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePrice),
      priceImpactTokenOut,
    };
  }

  async getTokenOutByTokenIn(
    tokenIn: { denom: string; amount: Int },
    tokenOutDenom: string,
    swapFee?: Dec
  ): Promise<Quote> {
    const inPoolAsset = this.getPoolAsset(tokenIn.denom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    tokenIn.amount = new Dec(tokenIn.amount)
      .mul(new Dec(1).sub(this.takerFee))
      .truncate();

    const coinIn = new Coin(tokenIn.denom, tokenIn.amount);

    let beforeSpotPriceInOverOut: Dec;
    let tokenOutAmount: Int;
    try {
      beforeSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
        this.stableSwapTokens,
        inPoolAsset.denom,
        outPoolAsset.denom
      );

      tokenOutAmount = StableSwapMath.calcOutGivenIn(
        this.stableSwapTokens,
        coinIn,
        outPoolAsset.denom,
        swapFee ?? this.swapFee
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }

    if (tokenOutAmount.lte(new Int(0))) throw new NotEnoughLiquidityError();

    const movedStableTokens: StableSwapToken[] = this.stableSwapTokens.map(
      (token) => {
        if (token.denom === tokenIn.denom) {
          return {
            ...token,
            amount: token.amount.add(new Dec(tokenIn.amount)),
          };
        }
        if (token.denom === tokenOutDenom) {
          return {
            ...token,
            amount: token.amount.sub(new Dec(tokenOutAmount)),
          };
        }
        return token;
      }
    );
    let afterSpotPriceInOverOut;
    try {
      afterSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
        movedStableTokens,
        tokenIn.denom,
        outPoolAsset.denom
      );
    } catch (e: any) {
      // considered not enough liquidity
      if (e.message === "cannot input more than y reserve")
        throw new NotEnoughLiquidityError(e.message);
      else throw e;
    }

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
    const priceImpactTokenOut = effectivePrice
      .quo(beforeSpotPriceInOverOut)
      .sub(new Dec("1"));

    return {
      amount: tokenOutAmount,
      beforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        beforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(afterSpotPriceInOverOut),
      effectivePriceInOverOut: effectivePrice,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(effectivePrice),
      priceImpactTokenOut,
    };
  }

  getLimitAmountByTokenIn(denom: string): Int {
    return this.getPoolAsset(denom)
      .amount.toDec()
      .mul(new Dec("0.3"))
      .truncate();
  }
}
