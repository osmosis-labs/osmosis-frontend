import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Dec, Int } from "@keplr-wallet/unit";

import { validateDenoms } from "../errors";
import { BasePool } from "../interface";
import { Quote, RoutablePool, Token } from "../router";
import { CosmwasmPoolRaw } from "./types";

// should be defined somewhere "project" wide
// also, initializing a client per async method is not ideal
const RPC_ENDPOINT = "https://osmosis-testnet-rpc.polkachu.com:443";

export class AstroportPclPool implements BasePool, RoutablePool {
  get type() {
    return "astroport-pcl" as const;
  }

  get id(): string {
    return this.raw.pool_id;
  }

  get swapFee(): Dec {
    return new Dec(0);
  }

  get exitFee(): Dec {
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

    const queryClient = await CosmWasmClient.connect(RPC_ENDPOINT);

    try {
      const simulateResponse = (await queryClient.queryContractSmart(
        this.raw.contract_address,
        {
          calc_out_amt_given_in: {
            token_in: {
              denom: tokenIn.denom,
              amount: tokenIn.amount.toString(),
            },
            token_out_denom: tokenOutDenom,
            swap_fee: this.swapFee.toString(),
          },
        }
      )) as {
        token_out: {
          amount: string;
          denom: string;
        };
      };

      return {
        ...defaultQuoteOptions,
        amount: new Int(simulateResponse.token_out.amount),
      };
    } catch {
      throw new Error("Contract quote simulation failed.");
    }
  }

  async getTokenInByTokenOut(
    tokenOut: Token,
    tokenInDenom: string
  ): Promise<Quote> {
    validateDenoms(this, tokenOut.denom, tokenInDenom);

    const publicClient = await CosmWasmClient.connect(RPC_ENDPOINT);

    try {
      const simulateResponse = (await publicClient.queryContractSmart(
        this.raw.contract_address,
        {
          calc_in_amt_given_out: {
            token_out: {
              denom: tokenOut.denom,
              amount: tokenOut.amount.toString(),
            },
            token_in_denom: tokenInDenom,
            swap_fee: this.swapFee.toString(),
          },
        }
      )) as {
        token_in: {
          amount: string;
          denom: string;
        };
      };

      return {
        ...defaultQuoteOptions,
        amount: new Int(simulateResponse.token_in.amount),
      };
    } catch {
      throw new Error("Contract quote simulation failed.");
    }
  }
}

// TODO: how should this be filled?
const defaultQuoteOptions = {
  beforeSpotPriceInOverOut: new Dec(1),
  beforeSpotPriceOutOverIn: new Dec(1),
  afterSpotPriceInOverOut: new Dec(1),
  afterSpotPriceOutOverIn: new Dec(1),
  effectivePriceInOverOut: new Dec(1),
  effectivePriceOutOverIn: new Dec(1),
  priceImpactTokenOut: new Dec(0),
};
