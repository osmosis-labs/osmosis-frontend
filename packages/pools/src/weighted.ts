import { Dec, Int } from "@keplr-wallet/unit";
import { WeightedPoolMath } from "@osmosis-labs/math";

import { SharePool } from "./interface";
import { RoutablePool, SwapResult } from "./router";

/** Raw query response representation of pool. */
export interface WeightedPoolRaw {
  "@type": string;
  id: string;
  pool_params: {
    // Dec
    swap_fee: string;
    // Dec
    exit_fee: string;
    smooth_weight_change_params: {
      // Timestamp
      start_time: string;
      // Seconds with s suffix. Ex) 3600s
      duration: string;
      initial_pool_weights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
      target_pool_weights: {
        token: {
          denom: string;
          // Int
          amount: string;
        };
        // Int
        weight: string;
      }[];
    } | null;
  };
  // Int
  total_weight: string;
  total_shares: {
    denom: string;
    // Int
    amount: string;
  };
  pool_assets: {
    // Int
    weight: string;
    token: {
      denom: string;
      // Int
      amount: string;
    };
  }[];
}

// TODO: use Int, and Duration types instead of raw strings
/** Parameters of LBP. */
export type SmoothWeightChangeParams = {
  /** Timestamp */
  startTime: string;
  /** Seconds with s suffix. Ex) 3600s */
  duration: string;
  initialPoolWeights: {
    token: {
      denom: string;
      /** Int */
      amount: string;
    };
    /** Int */
    weight: string;
  }[];
  targetPoolWeights: {
    token: {
      denom: string;
      /** Int */
      amount: string;
    };
    /** Int */
    weight: string;
  }[];
};

/** Implementation of Pool interface w/ related weighted/balancer calculations & metadata. */
export class WeightedPool implements SharePool, RoutablePool {
  get type(): "weighted" {
    return "weighted";
  }

  get id(): string {
    return this.raw.id;
  }

  get totalWeight(): Int {
    return new Int(this.raw.total_weight);
  }

  get poolAssets(): { denom: string; amount: Int; weight: Int }[] {
    return this.raw.pool_assets.map((asset) => {
      return {
        denom: asset.token.denom,
        amount: new Int(asset.token.amount),
        weight: new Int(asset.weight),
      };
    });
  }

  get poolAssetDenoms(): string[] {
    return this.raw.pool_assets.map((asset) => asset.token.denom);
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

  /** LBP pool */
  get smoothWeightChange(): SmoothWeightChangeParams | undefined {
    if (this.raw.pool_params.smooth_weight_change_params !== null) {
      const {
        start_time,
        duration,
        initial_pool_weights,
        target_pool_weights,
      } = this.raw.pool_params.smooth_weight_change_params;
      return {
        startTime: start_time,
        duration,
        initialPoolWeights: initial_pool_weights,
        targetPoolWeights: target_pool_weights,
      };
    }
  }

  constructor(public readonly raw: WeightedPoolRaw) {}

  getPoolAsset(denom: string): { denom: string; amount: Int; weight: Int } {
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

    return WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      this.swapFee
    );
  }

  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    return WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(0)
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

  async getTokenInByTokenOut(
    tokenOut: { denom: string; amount: Int },
    tokenInDenom: string,
    swapFee?: Dec
  ): Promise<SwapResult> {
    const inPoolAsset = this.getPoolAsset(tokenInDenom);
    const outPoolAsset = this.getPoolAsset(tokenOut.denom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      swapFee ?? this.swapFee
    );

    const tokenInAmount = WeightedPoolMath.calcInGivenOut(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenOut.amount),
      swapFee ?? this.swapFee
    ).truncate();

    const afterSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenInAmount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOut.amount)),
      new Dec(outPoolAsset.weight),
      swapFee ?? this.swapFee
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

  async getTokenOutByTokenIn(
    tokenIn: { denom: string; amount: Int },
    tokenOutDenom: string,
    swapFee?: Dec
  ): Promise<SwapResult> {
    const inPoolAsset = this.getPoolAsset(tokenIn.denom);
    const outPoolAsset = this.getPoolAsset(tokenOutDenom);

    const beforeSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      swapFee ?? this.swapFee
    );

    const tokenOutAmount = WeightedPoolMath.calcOutGivenIn(
      new Dec(inPoolAsset.amount),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount),
      new Dec(outPoolAsset.weight),
      new Dec(tokenIn.amount),
      swapFee ?? this.swapFee
    ).truncate();

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

    const afterSpotPriceInOverOut = WeightedPoolMath.calcSpotPrice(
      new Dec(inPoolAsset.amount).add(new Dec(tokenIn.amount)),
      new Dec(inPoolAsset.weight),
      new Dec(outPoolAsset.amount).sub(new Dec(tokenOutAmount)),
      new Dec(outPoolAsset.weight),
      swapFee ?? this.swapFee
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
    const tokenIn = this.getPoolAsset(tokenInDenom);
    const tokenOut = this.getPoolAsset(tokenOutDenom);

    return tokenOut.amount
      .toDec()
      .mul(tokenIn.weight.toDec())
      .quo(tokenIn.weight.toDec().add(tokenOut.weight.toDec()));
  }

  getLimitAmountByTokenIn(denom: string): Int {
    return this.getPoolAsset(denom)
      .amount.toDec()
      .mul(new Dec("0.3"))
      .truncate();
  }
}
