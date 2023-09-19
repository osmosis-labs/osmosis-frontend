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

  // Interface: RoutablePool

  getLimitAmountByTokenIn(denom: string): Int {
    const amount = this.raw.tokens.find(
      ({ denom: tokenDenom }) => tokenDenom === denom
    )?.amount;
    if (!amount) throw new Error("Invalid denom");
    return new Int(amount);
  }

  // transmute() https://github.com/osmosis-labs/transmuter/blob/c14cfa7a6adff5336a94c3caee7f94544757cd92/contracts/transmuter/src/transmuter_pool/transmute.rs#L8

  async getTokenOutByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<Quote> {
    validateDenoms(this, tokenIn.denom, tokenOutDenom);

    if (this.getLimitAmountByTokenIn(tokenOutDenom).lt(tokenIn.amount)) {
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

    if (this.getLimitAmountByTokenIn(tokenInDenom).lt(tokenOut.amount)) {
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
