import { Dec, Int } from "@keplr-wallet/unit";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  SplitTokenInQuote,
} from "@osmosis-labs/pools";

import { EncodedResponse } from "../worker";

export type EncodedNotEnoughLiquidityError = "NotEnoughLiquidityError";
export type EncodedNoRouteError = "NoRouteError";

// Error type is supported by structured clone.
// See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types
export type EncodedError =
  | EncodedNotEnoughLiquidityError
  | EncodedNoRouteError
  | Error;

/** Encodes expected exceptions explicitly, and falls back to the actual Error type. */
export function encodeError<TError extends Error>(error: TError): EncodedError {
  if (error instanceof NotEnoughLiquidityError) {
    return "NotEnoughLiquidityError";
  }
  if (error instanceof NoRouteError) {
    return "NoRouteError";
  }
  return error;
}

/** Checks response for error member, decodes it, and finally throws by default. */
export function checkResponseAndDecodeError(
  resp: EncodedResponse,
  throwError = true
): Error | undefined {
  if ("error" in resp) {
    const error = decodeError(resp.error);
    if (throwError) throw error;
    else return error;
  }
}

export function decodeError(error: EncodedError): Error {
  switch (error) {
    case "NotEnoughLiquidityError":
      return new NotEnoughLiquidityError();
    case "NoRouteError":
      return new NoRouteError();
    default:
      return error;
  }
}

/** For route by token in time outs, return a "0'd" response (no routes, no amounts, no prices) */
export const emptySplitTokenInQuote: SplitTokenInQuote = {
  amount: new Int(0),
  beforeSpotPriceInOverOut: new Dec(0),
  beforeSpotPriceOutOverIn: new Dec(0),
  afterSpotPriceInOverOut: new Dec(0),
  afterSpotPriceOutOverIn: new Dec(0),
  effectivePriceInOverOut: new Dec(0),
  effectivePriceOutOverIn: new Dec(0),
  priceImpactTokenOut: new Dec(0),
  split: [],
  tokenInFeeAmount: new Int(0),
  swapFee: new Dec(0),
};
