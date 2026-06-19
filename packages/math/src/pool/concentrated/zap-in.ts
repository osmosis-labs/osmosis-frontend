import { Int } from "@osmosis-labs/unit";

import { BigDec } from "../../big-dec";
import { calcAmount0Delta, calcAmount1Delta } from "./math";
import { tickToSqrtPrice } from "./tick";

/** Which side of the pool the user is providing as their single input asset.
 *  `base` is token0, `quote` is token1 (matching the pool's reserve coin order). */
export type ZapInInputSide = "base" | "quote";

export interface CalcZapInSwapAmountParams {
  /** Micro (raw, integer) amount of the asset the user is providing. */
  inputAmount: Int;
  /** Side the user is providing. `base` = token0, `quote` = token1. */
  inputSide: ZapInInputSide;
  lowerTick: Int;
  upperTick: Int;
  /** Pool's current sqrt price (chain-raw, on the micro-denom basis). */
  currentSqrtPrice: BigDec;
}

/**
 * Computes how much of the user's single input asset should be swapped into the
 * counterparty asset so that, after the swap, the two resulting amounts match the
 * ratio a concentrated-liquidity position requires at the chosen range.
 *
 * The split is projected at the current spot price (`currentSqrtPrice^2`). Swap
 * fees, spread and price impact are intentionally not modeled here — the caller
 * quotes the returned swap amount through SQS to get the real output, and the
 * user's slippage tolerance absorbs the drift between this projection and
 * execution. See `frontend--single-side-join-cl` plan, "Convergence".
 *
 * Returns the micro amount of `inputSide` to swap, clamped to `[0, inputAmount]`:
 * - `0`  => range is entirely on the side of the input asset; no swap needed.
 * - full => range is entirely on the opposite side; swap the whole input.
 *
 * Works purely on micro amounts and the chain sqrt price, so it makes no
 * assumption about token decimals.
 */
export function calcZapInSwapAmount({
  inputAmount,
  inputSide,
  lowerTick,
  upperTick,
  currentSqrtPrice,
}: CalcZapInSwapAmountParams): Int {
  const zero = new Int(0);

  if (inputAmount.lte(zero) || currentSqrtPrice.isZero()) return zero;

  const lowerSqrtPrice = new BigDec(tickToSqrtPrice(lowerTick));
  const upperSqrtPrice = new BigDec(tickToSqrtPrice(upperTick));

  // Reference amounts for a unit of liquidity, clamped to where spot sits
  // relative to the range. This yields the position's required (a0 : a1) ratio,
  // and degenerates cleanly to one-sided (a0 = 0 or a1 = 0) when out of range.
  const unitLiquidity = new BigDec(1);
  let a0: BigDec;
  let a1: BigDec;
  if (currentSqrtPrice.lte(lowerSqrtPrice)) {
    // spot at/below the range => position is entirely token0 (base)
    a0 = calcAmount0Delta(unitLiquidity, lowerSqrtPrice, upperSqrtPrice, false);
    a1 = new BigDec(0);
  } else if (currentSqrtPrice.gte(upperSqrtPrice)) {
    // spot at/above the range => position is entirely token1 (quote)
    a0 = new BigDec(0);
    a1 = calcAmount1Delta(unitLiquidity, lowerSqrtPrice, upperSqrtPrice, false);
  } else {
    a0 = calcAmount0Delta(
      unitLiquidity,
      currentSqrtPrice,
      upperSqrtPrice,
      false
    );
    a1 = calcAmount1Delta(
      unitLiquidity,
      lowerSqrtPrice,
      currentSqrtPrice,
      false
    );
  }

  // spot price = token1 per token0, on the micro-denom basis
  const spotPrice = currentSqrtPrice.mul(currentSqrtPrice);
  const amount = new BigDec(inputAmount);
  const priceWeightedBase = spotPrice.mul(a0);

  let swapAmount: BigDec;
  if (inputSide === "base") {
    // Swap `s` token0 -> `s * spot` token1. Solve
    //   (s * spot) / (input - s) = a1 / a0  =>  s = a1 * input / (spot*a0 + a1)
    const denominator = priceWeightedBase.add(a1);
    if (denominator.lte(new BigDec(0))) return zero;
    swapAmount = a1.mul(amount).quo(denominator);
  } else {
    // Swap `s` token1 -> `s / spot` token0. Solve
    //   (input - s) / (s / spot) = a1 / a0  =>  s = input * spot*a0 / (a1 + spot*a0)
    const denominator = a1.add(priceWeightedBase);
    if (denominator.lte(new BigDec(0))) return zero;
    swapAmount = amount.mul(priceWeightedBase).quo(denominator);
  }

  const swapAmountInt = swapAmount.truncate();
  if (swapAmountInt.lte(zero)) return zero;
  if (swapAmountInt.gt(inputAmount)) return inputAmount;
  return swapAmountInt;
}
