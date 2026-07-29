import { Dec, Int } from "@osmosis-labs/unit";

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
 * Reference amounts of token0 (`a0`) and token1 (`a1`) for a unit of liquidity
 * at `sqrtPrice`, clamped to where that price sits relative to the range. This
 * is the (a0 : a1) ratio a position over `[lowerTick, upperTick]` requires,
 * and degenerates cleanly to one-sided (a0 = 0 or a1 = 0) when out of range.
 */
export function calcDepositRatio({
  lowerTick,
  upperTick,
  sqrtPrice,
}: {
  lowerTick: Int;
  upperTick: Int;
  sqrtPrice: BigDec;
}): { a0: BigDec; a1: BigDec } {
  const lowerSqrtPrice = new BigDec(tickToSqrtPrice(lowerTick));
  const upperSqrtPrice = new BigDec(tickToSqrtPrice(upperTick));

  const unitLiquidity = new BigDec(1);
  if (sqrtPrice.lte(lowerSqrtPrice)) {
    // price at/below the range => position is entirely token0 (base)
    return {
      a0: calcAmount0Delta(
        unitLiquidity,
        lowerSqrtPrice,
        upperSqrtPrice,
        false
      ),
      a1: new BigDec(0),
    };
  }
  if (sqrtPrice.gte(upperSqrtPrice)) {
    // price at/above the range => position is entirely token1 (quote)
    return {
      a0: new BigDec(0),
      a1: calcAmount1Delta(
        unitLiquidity,
        lowerSqrtPrice,
        upperSqrtPrice,
        false
      ),
    };
  }
  return {
    a0: calcAmount0Delta(unitLiquidity, sqrtPrice, upperSqrtPrice, false),
    a1: calcAmount1Delta(unitLiquidity, lowerSqrtPrice, sqrtPrice, false),
  };
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

  const { a0, a1 } = calcDepositRatio({
    lowerTick,
    upperTick,
    sqrtPrice: currentSqrtPrice,
  });

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

/** One active-liquidity tick range of a CL pool, as returned by the
 *  liquidity-per-tick-range query. Ranges are expected to tile the price line
 *  (no overlap); gaps and zero-liquidity ranges are crossed instantly. */
export interface ActiveLiquidityDepth {
  lowerTick: Int;
  upperTick: Int;
  liquidityAmount: Dec;
}

/**
 * Estimates the pool's sqrt price after swapping `tokenInAmount` of
 * `inputSide` INTO this pool, by walking the pool's active-liquidity tick
 * ranges with the chain's within-range swap math:
 * - token0 in => price moves DOWN:  Δ0 = L·(Pc − Pt)/(Pc·Pt)
 * - token1 in => price moves UP:    Δ1 = L·(Pt − Pc)
 *
 * `tokenInAmount` must already have the pool's spread factor (and any taker
 * fee) deducted — the chain charges fees on token-in before the price math.
 *
 * When the provided depths are exhausted before the input is consumed, the
 * furthest reached boundary is returned (i.e. the movement is overstated
 * rather than understated — callers using this for minima should envelope
 * against the pre-swap price, see `calcZapInPositionMinima`).
 */
export function estimateSqrtPriceAfterSwapIn({
  tokenInAmount,
  inputSide,
  currentSqrtPrice,
  liquidityDepths,
}: {
  tokenInAmount: Int;
  inputSide: ZapInInputSide;
  currentSqrtPrice: BigDec;
  liquidityDepths: ActiveLiquidityDepth[];
}): BigDec {
  if (tokenInAmount.lte(new Int(0)) || liquidityDepths.length === 0)
    return currentSqrtPrice;

  // Sorted copies with sqrt price bounds. Walk direction: token0 in moves the
  // price down through descending ranges; token1 in moves it up.
  const ranges = liquidityDepths
    .map((d) => ({
      lowerSqrt: new BigDec(tickToSqrtPrice(d.lowerTick)),
      upperSqrt: new BigDec(tickToSqrtPrice(d.upperTick)),
      liquidity: new BigDec(d.liquidityAmount),
    }))
    .sort((a, b) => (a.lowerSqrt.lt(b.lowerSqrt) ? -1 : 1));

  let remaining = new BigDec(tokenInAmount);
  let sqrtPrice = currentSqrtPrice;

  if (inputSide === "base") {
    for (let i = ranges.length - 1; i >= 0; i--) {
      const { lowerSqrt, upperSqrt, liquidity } = ranges[i];
      // Skip ranges entirely above the current price.
      if (lowerSqrt.gte(sqrtPrice)) continue;
      const from = sqrtPrice.lt(upperSqrt) ? sqrtPrice : upperSqrt;
      if (liquidity.lte(new BigDec(0))) {
        // Zero-liquidity gap: the price crosses it without consuming input.
        sqrtPrice = lowerSqrt;
        continue;
      }
      // token0 capacity of this range from `from` down to its lower bound
      const capacity = liquidity
        .mul(from.sub(lowerSqrt))
        .quo(from.mul(lowerSqrt));
      if (remaining.lte(capacity)) {
        // Pt = L·Pc / (L + Δ0·Pc)
        return liquidity.mul(from).quo(liquidity.add(remaining.mul(from)));
      }
      remaining = remaining.sub(capacity);
      sqrtPrice = lowerSqrt;
    }
    return sqrtPrice; // depths exhausted: furthest reached boundary
  }

  for (const { lowerSqrt, upperSqrt, liquidity } of ranges) {
    // Skip ranges entirely below the current price.
    if (upperSqrt.lte(sqrtPrice)) continue;
    const from = sqrtPrice.gt(lowerSqrt) ? sqrtPrice : lowerSqrt;
    if (liquidity.lte(new BigDec(0))) {
      sqrtPrice = upperSqrt;
      continue;
    }
    // token1 capacity of this range from `from` up to its upper bound
    const capacity = liquidity.mul(upperSqrt.sub(from));
    if (remaining.lte(capacity)) {
      // Pt = Pc + Δ1/L
      return from.add(remaining.quo(liquidity));
    }
    remaining = remaining.sub(capacity);
    sqrtPrice = upperSqrt;
  }
  return sqrtPrice;
}

/**
 * Slippage floors (`tokenMinAmount0/1`) for the zap-in's create-position leg.
 *
 * The chain fits `tokensProvided` caps `(cap0, cap1)` to the position's
 * required ratio at the sqrt price AT EXECUTION — after the swap leg. The
 * expected consumption of each side is therefore the ratio-fit
 * `λ = min(cap0/a0, cap1/a1)`, `used_i = λ·a_i`, evaluated at that price.
 *
 * When the swap routes through the destination pool itself, the execution
 * price differs from spot by the swap's own movement; pass the estimated
 * `postSwapSqrtPrice` (see `estimateSqrtPriceAfterSwapIn`). Consumption is
 * then enveloped: each side's minimum buffers below the LOWER of its expected
 * usage at the pre-swap and post-swap prices, so any partial movement (fee
 * estimation error, a depths-exhausted overestimate, external reversion)
 * between the two cannot push actual usage below its floor. One
 * slippage-width of buffer per side covers drift beyond the envelope.
 */
export function calcZapInPositionMinima({
  cap0,
  cap1,
  lowerTick,
  upperTick,
  currentSqrtPrice,
  postSwapSqrtPrice,
  slippage,
}: {
  /** Max token0 provided to the position (micro). */
  cap0: Int;
  /** Max token1 provided to the position (micro). */
  cap1: Int;
  lowerTick: Int;
  upperTick: Int;
  currentSqrtPrice: BigDec;
  /** Estimated pool sqrt price after the swap leg, when it differs from spot
   *  (route through the destination pool). Omit when the route avoids the
   *  destination pool. */
  postSwapSqrtPrice?: BigDec;
  /** User slippage tolerance as a fraction (e.g. 0.005). */
  slippage: Dec;
}): { tokenMinAmount0: Int; tokenMinAmount1: Int } {
  const usageAt = (sqrtPrice: BigDec): { used0: BigDec; used1: BigDec } => {
    const { a0, a1 } = calcDepositRatio({ lowerTick, upperTick, sqrtPrice });
    const c0 = new BigDec(cap0);
    const c1 = new BigDec(cap1);
    // One-sided ranges consume the full cap of the live side only.
    if (a0.lte(new BigDec(0))) return { used0: new BigDec(0), used1: c1 };
    if (a1.lte(new BigDec(0))) return { used0: c0, used1: new BigDec(0) };
    const lambda0 = c0.quo(a0);
    const lambda1 = c1.quo(a1);
    const lambda = lambda0.lt(lambda1) ? lambda0 : lambda1;
    return { used0: lambda.mul(a0), used1: lambda.mul(a1) };
  };

  const atCurrent = usageAt(currentSqrtPrice);
  let used0 = atCurrent.used0;
  let used1 = atCurrent.used1;
  if (postSwapSqrtPrice && !postSwapSqrtPrice.equals(currentSqrtPrice)) {
    const atPost = usageAt(postSwapSqrtPrice);
    used0 = used0.lt(atPost.used0) ? used0 : atPost.used0;
    used1 = used1.lt(atPost.used1) ? used1 : atPost.used1;
  }

  const buffer = new BigDec(new Dec(1).sub(slippage));
  return {
    tokenMinAmount0: used0.mul(buffer).truncate(),
    tokenMinAmount1: used1.mul(buffer).truncate(),
  };
}
