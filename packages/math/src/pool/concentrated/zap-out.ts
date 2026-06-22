import { Int } from "@osmosis-labs/unit";

import { BigDec } from "../../big-dec";

/** Which side of the pool is being swapped on the way out.
 *  `base` is token0, `quote` is token1 (matching the pool's reserve coin order). */
export type ZapOutSwapSide = "base" | "quote";

export interface CalcZapOutSwapAmountParams {
  /** Micro (raw, integer) token0 amount withdrawn from the position. */
  baseWithdrawn: Int;
  /** Micro (raw, integer) token1 amount withdrawn from the position. */
  quoteWithdrawn: Int;
  /** Pool's current sqrt price (chain-raw, on the micro-denom basis). */
  currentSqrtPrice: BigDec;
  /** Target fraction of the total withdrawn *value* to end holding in token0
   *  (base), in `[0, 1]`. `1` = swap everything into base, `0` = everything into
   *  quote, and the value-split that equals the withdrawn ratio means no swap. */
  targetBaseValueFraction: BigDec;
}

export interface ZapOutSwap {
  /** Which withdrawn side to swap. */
  swapSide: ZapOutSwapSide;
  /** Micro amount of `swapSide` to swap. Zero when no swap is needed. */
  swapInAmount: Int;
}

/**
 * Computes how much of one withdrawn side to swap into the other so that the
 * resulting wallet holdings match a target value-split. This is the reverse of
 * `calcZapInSwapAmount`: the withdrawn amounts are already known (the chain
 * returns both sides at the position's current spot ratio), so this only
 * rebalances them at spot to hit `targetBaseValueFraction`.
 *
 * Value is measured in token1 (quote) terms via the spot price
 * `P = currentSqrtPrice^2` (token1 per token0). Works purely on micro amounts
 * and the chain sqrt price, so it makes no assumption about token decimals.
 *
 * Returns `{ swapSide, swapInAmount }`:
 * - `swapInAmount === 0`  => holdings already match the target; no swap.
 * - swap `quote`          => target wants more base than withdrawn; sell quote.
 * - swap `base`           => target wants more quote than withdrawn; sell base.
 *
 * The returned `swapInAmount` is clamped to the available withdrawn amount of
 * the side being swapped, so it can never request more than was withdrawn.
 */
export function calcZapOutSwapAmount({
  baseWithdrawn,
  quoteWithdrawn,
  currentSqrtPrice,
  targetBaseValueFraction,
}: CalcZapOutSwapAmountParams): ZapOutSwap {
  const zero = new Int(0);
  const noSwap: ZapOutSwap = { swapSide: "base", swapInAmount: zero };

  if (currentSqrtPrice.isZero()) return noSwap;
  if (baseWithdrawn.lte(zero) && quoteWithdrawn.lte(zero)) return noSwap;

  // Clamp the target fraction into [0, 1] defensively.
  const one = new BigDec(1);
  const zeroDec = new BigDec(0);
  let target = targetBaseValueFraction;
  if (target.lt(zeroDec)) target = zeroDec;
  if (target.gt(one)) target = one;

  const spotPrice = currentSqrtPrice.mul(currentSqrtPrice); // token1 per token0
  const base = new BigDec(baseWithdrawn);
  const quote = new BigDec(quoteWithdrawn);

  // All values in token1 (quote) terms.
  const baseValue = base.mul(spotPrice);
  const totalValue = baseValue.add(quote);
  if (totalValue.lte(zeroDec)) return noSwap;

  const targetBaseValue = target.mul(totalValue);

  if (targetBaseValue.gt(baseValue)) {
    // Need more base: sell quote -> base. The quote value to convert is the
    // shortfall in base value (quote is the value unit, so value == amount).
    const quoteToSwap = targetBaseValue.sub(baseValue);
    let swapInAmount = quoteToSwap.truncate();
    if (swapInAmount.gt(quoteWithdrawn)) swapInAmount = quoteWithdrawn;
    if (swapInAmount.lte(zero)) return noSwap;
    return { swapSide: "quote", swapInAmount };
  }

  if (targetBaseValue.lt(baseValue)) {
    // Need more quote: sell base -> quote. Convert the surplus base value back
    // into a base amount by dividing by the spot price.
    const baseValueToSwap = baseValue.sub(targetBaseValue);
    let swapInAmount = baseValueToSwap.quo(spotPrice).truncate();
    if (swapInAmount.gt(baseWithdrawn)) swapInAmount = baseWithdrawn;
    if (swapInAmount.lte(zero)) return noSwap;
    return { swapSide: "base", swapInAmount };
  }

  // targetBaseValue === baseValue: holdings already match the target.
  return noSwap;
}
