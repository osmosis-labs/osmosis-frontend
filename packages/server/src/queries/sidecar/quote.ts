import { Dec, Int } from "@osmosis-labs/unit";

/** Pool type as returned on a sidecar quote, before CosmWasm code-id narrowing. */
export type SidecarQuotePoolType =
  | "concentrated"
  | "weighted"
  | "stable"
  | "transmuter"
  | "alloyed"
  | "cosmwasm";

export type Token = {
  denom: string;
  amount: Int;
};

export type QuotePool = {
  id: string;
  swapFee?: Dec;
  type?: SidecarQuotePoolType;
  codeId?: string;
};

export type RouteWithInAmount = {
  pools: QuotePool[];
  tokenOutDenoms: string[];
  tokenInDenom: string;
  initialAmount: Int;
};

export type RouteWithOutAmount = {
  pools: QuotePool[];
  tokenInDenoms: string[];
  tokenOutDenom: string;
  initialAmount: Int;
};

export type SplitTokenInQuote = {
  amount: Int;
  split: RouteWithInAmount[];
  tokenInFeeAmount?: Int;
  swapFee?: Dec;
  priceImpactTokenOut?: Dec;
  liquidityCap?: string;
  liquidityCapOverflow?: boolean;
  tokens?: {
    denom: string;
    liquidity_cap: string;
  }[];
};

export type SplitTokenOutQuote = {
  amount: Int;
  split: RouteWithOutAmount[];
  tokenInFeeAmount?: Int;
  swapFee?: Dec;
  priceImpactTokenOut?: Dec;
  tokens?: {
    denom: string;
    liquidity_cap: string;
  }[];
};
