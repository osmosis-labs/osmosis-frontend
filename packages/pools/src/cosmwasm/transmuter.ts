import { Dec, Int } from "@keplr-wallet/unit";

import { NotEnoughLiquidityError, validateDenoms } from "../errors";
import { BasePool } from "../interface";
import { Quote, RoutablePool, Token } from "../router";
import { CosmwasmPoolRaw } from "./types";

export class TransmuterPool implements BasePool, RoutablePool {
  get type() {
    return "transmuter" as const;
  }

  get id(): string {
    return this.raw.pool_id;
  }

  get swapFee(): Dec {
    return new Dec(0);
  }

  get exitFee(): Dec {
    // TODO; confirm if there is no liquidity exchange fee
    return new Dec(0);
  }

  get takerFee(): Dec {
    return new Dec(this.raw.taker_fee);
  }

  get poolAssetDenoms(): string[] {
    return this.raw.tokens.map(({ denom }) => denom);
  }

  get poolAssets(): { denom: string; amount: Int }[] {
    return this.raw.tokens.map(({ denom, amount }) => ({
      denom,
      amount: new Int(amount),
    }));
  }

  constructor(readonly raw: CosmwasmPoolRaw) {}

  // Interface: BasePool

  hasPoolAsset(denom: string): boolean {
    return this.raw.tokens.some(
      ({ denom: tokenDenom }) => tokenDenom === denom
    );
  }

  getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);
    return new Dec(1);
  }
  getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);
    return new Dec(1);
  }
  getSpotPriceInOverOutWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);
    return new Dec(1);
  }
  getSpotPriceOutOverInWithoutSwapFee(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Dec {
    validateDenoms(this, tokenInDenom, tokenOutDenom);
    return new Dec(1);
  }

  /** Find the min other token that could be swapped out, since ratio is 1:1. */
  getLimitAmountByTokenIn(denom: string): Int {
    const outAmounts = this.raw.tokens
      .filter(({ denom: tokenDenom }) => tokenDenom !== denom)
      .map(({ amount }) => new Int(amount));
    return outAmounts.reduce(
      (min, amount) => (amount.lt(min) ? amount : min),
      new Int(Number.MAX_SAFE_INTEGER)
    );
  }

  async getTokenOutByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<Quote> {
    validateDenoms(this, tokenIn.denom, tokenOutDenom);

    const outAssetAmount = this.poolAssets.find(
      ({ denom }) => denom === tokenOutDenom
    )?.amount;
    if (!outAssetAmount || outAssetAmount.lt(tokenIn.amount)) {
      throw new NotEnoughLiquidityError();
    }

    return {
      ...transmuterQuoteCommon,
      amount: tokenIn.amount,
    };
  }

  async getTokenInByTokenOut(
    tokenOut: Token,
    tokenInDenom: string
  ): Promise<Quote> {
    validateDenoms(this, tokenOut.denom, tokenInDenom);

    const inAssetAmount = this.poolAssets.find(
      ({ denom }) => denom === tokenInDenom
    )?.amount;
    if (!inAssetAmount || inAssetAmount.lt(tokenOut.amount)) {
      throw new NotEnoughLiquidityError();
    }

    return {
      ...transmuterQuoteCommon,
      amount: tokenOut.amount,
    };
  }
}

// Ratio is 1:1, so these are common across all swaps.
const transmuterQuoteCommon = {
  beforeSpotPriceInOverOut: new Dec(1),
  beforeSpotPriceOutOverIn: new Dec(1),
  afterSpotPriceInOverOut: new Dec(1),
  afterSpotPriceOutOverIn: new Dec(1),
  effectivePriceInOverOut: new Dec(1),
  effectivePriceOutOverIn: new Dec(1),
  priceImpactTokenOut: new Dec(0),
};
