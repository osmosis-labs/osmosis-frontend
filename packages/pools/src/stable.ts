import { Coin, Dec, Int } from "@keplr-wallet/unit";
import { StableSwapMath, StableSwapToken } from "@osmosis-labs/math";

import { SharePool } from "./interface";
import { RoutablePool } from "./routes";

/** Raw query response representation of pool. */
export interface StablePoolRaw {
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
}

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

    return StableSwapMath.calcSpotPrice(
      this.stableSwapTokens,
      inPoolAsset.denom,
      outPoolAsset.denom
    );
  }

  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    return StableSwapMath.calcSpotPrice(
      this.stableSwapTokens,
      inPoolAsset.denom,
      outPoolAsset.denom
    );
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

  getTokenInByTokenOut(
    tokenOut: { denom: string; amount: Int },
    tokenInDenom: string,
    swapFee?: Dec
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
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOut.denom);

    const coinOut = new Coin(tokenOut.denom, tokenOut.amount);

    const beforeSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
      this.stableSwapTokens,
      inPoolAsset.denom,
      outPoolAsset.denom
    );

    const tokenInAmount = StableSwapMath.calcInGivenOut(
      this.stableSwapTokens,
      coinOut,
      tokenInDenom,
      swapFee ?? this.swapFee
    );

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
    const afterSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
      movedStableTokens,
      inPoolAsset.denom,
      outPoolAsset.denom
    );

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenInAmount).quo(new Dec(tokenOut.amount));
    const priceImpact = effectivePrice
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
      priceImpact,
    };
  }

  getTokenOutByTokenIn(
    tokenIn: { denom: string; amount: Int },
    tokenOutDenom: string,
    swapFee?: Dec
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
    const inPoolAsset = this.getPoolAsset(tokenIn.denom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    const coinIn = new Coin(tokenIn.denom, tokenIn.amount);

    const beforeSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
      this.stableSwapTokens,
      inPoolAsset.denom,
      outPoolAsset.denom
    );

    const tokenOutAmount = StableSwapMath.calcOutGivenIn(
      this.stableSwapTokens,
      coinIn,
      outPoolAsset.denom,
      swapFee ?? this.swapFee
    );

    if (tokenOutAmount.equals(new Int(0))) {
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
    const afterSpotPriceInOverOut = StableSwapMath.calcSpotPrice(
      movedStableTokens,
      tokenIn.denom,
      outPoolAsset.denom
    );

    if (afterSpotPriceInOverOut.lt(beforeSpotPriceInOverOut)) {
      throw new Error("Spot price can't be decreased after swap");
    }

    const effectivePrice = new Dec(tokenIn.amount).quo(new Dec(tokenOutAmount));
    const priceImpact = effectivePrice
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
      priceImpact,
    };
  }

  getNormalizedLiquidity(tokenInDenom: string, tokenOutDenom: string): Dec {
    const tokenOut = this.getPoolAsset(tokenOutDenom);
    const tokenIn = this.getPoolAsset(tokenInDenom);

    return tokenOut.amount
      .toDec()
      .mul(new Dec(tokenIn.scalingFactor))
      .quo(new Dec(tokenIn.scalingFactor).add(new Dec(tokenOut.scalingFactor))); // TODO: ensure this works in router
  }

  getLimitAmountByTokenIn(denom: string): Int {
    return this.getPoolAsset(denom)
      .amount.toDec()
      .mul(new Dec("0.3"))
      .truncate();
  }
}
