import { Dec } from "@osmosis-labs/unit";

import { approxSqrt } from "../../utils";

/**
 * Clamps a price into the position's range, since amounts-at-price formulas
 * treat any price beyond an edge as sitting exactly on that edge (the
 * position is fully one-sided there).
 */
function clampToRange(price: Dec, lowerPrice: Dec, upperPrice: Dec): Dec {
  if (price.lt(lowerPrice)) return lowerPrice;
  if (price.gt(upperPrice)) return upperPrice;
  return price;
}

function isInvalidRange(
  lowerPrice: Dec,
  upperPrice: Dec,
  ...prices: Dec[]
): boolean {
  return (
    !lowerPrice.isPositive() ||
    !upperPrice.isPositive() ||
    lowerPrice.gte(upperPrice) ||
    prices.some((p) => !p.isPositive())
  );
}

/**
 * Capital-efficiency multiplier of a concentrated range versus a full-range
 * position holding the same value at the given spot price: how many times
 * more liquidity (and therefore fee share while in range) a dollar provides
 * when concentrated into [lowerPrice, upperPrice].
 *
 * Derivation: for liquidity L at spot p inside [pa, pb], the position value
 * in quote units is `L(2√p − √pa − p/√pb)`; a full-range position of the same
 * L is worth `2L√p`. The value ratio at equal L inverts into the liquidity
 * ratio at equal value. A spot outside the range is clamped to the nearest
 * edge (the multiplier of the range at its boundary).
 *
 * Returns undefined on degenerate input (non-positive prices, empty range).
 */
export function calcCapitalEfficiency({
  lowerPrice,
  upperPrice,
  spotPrice,
}: {
  lowerPrice: Dec;
  upperPrice: Dec;
  spotPrice: Dec;
}): Dec | undefined {
  if (isInvalidRange(lowerPrice, upperPrice, spotPrice)) return undefined;

  const p = clampToRange(spotPrice, lowerPrice, upperPrice);
  const sqrtP = approxSqrt(p);
  const sqrtPa = approxSqrt(lowerPrice);
  const sqrtPb = approxSqrt(upperPrice);

  const fullRangeValue = sqrtP.mul(new Dec(2));
  const rangeValue = fullRangeValue.sub(sqrtPa).sub(p.quo(sqrtPb));
  if (!rangeValue.isPositive()) return undefined;

  return fullRangeValue.quo(rangeValue);
}

/**
 * Value of a concentrated position versus simply holding the deposited
 * tokens, for a deposit made at `entryPrice` into [lowerPrice, upperPrice]
 * and evaluated at `exitPrice`. Values are normalized to a 1-quote-unit
 * deposit; `deltaVsHold` is the impermanent-loss fraction (negative =
 * position worth less than holding). Fees and incentives are deliberately
 * excluded — this isolates the divergence cost.
 *
 * Standard CL amounts: with s = √(price clamped to the range),
 * base x = L(1/s − 1/√pb) and quote y = L(s − √pa); position value at p is
 * x·p + y, and the hold portfolio keeps the entry amounts forever.
 *
 * Returns undefined on degenerate input.
 */
export function calcPositionValueVsHold({
  lowerPrice,
  upperPrice,
  entryPrice,
  exitPrice,
}: {
  lowerPrice: Dec;
  upperPrice: Dec;
  entryPrice: Dec;
  exitPrice: Dec;
}):
  | {
      positionValue: Dec;
      holdValue: Dec;
      deltaVsHold: Dec;
    }
  | undefined {
  if (isInvalidRange(lowerPrice, upperPrice, entryPrice, exitPrice))
    return undefined;

  const sqrtPa = approxSqrt(lowerPrice);
  const sqrtPb = approxSqrt(upperPrice);

  const amountsAt = (price: Dec) => {
    const s = approxSqrt(clampToRange(price, lowerPrice, upperPrice));
    return {
      base: new Dec(1).quo(s).sub(new Dec(1).quo(sqrtPb)),
      quote: s.sub(sqrtPa),
    };
  };

  // Unit-liquidity entry amounts, then normalize liquidity so the deposit is
  // worth exactly 1 quote unit at entry.
  const entry = amountsAt(entryPrice);
  const unitEntryValue = entry.base.mul(entryPrice).add(entry.quote);
  if (!unitEntryValue.isPositive()) return undefined;
  const liquidity = new Dec(1).quo(unitEntryValue);

  const exit = amountsAt(exitPrice);
  const positionValue = exit.base.mul(exitPrice).add(exit.quote).mul(liquidity);
  const holdValue = entry.base.mul(exitPrice).add(entry.quote).mul(liquidity);
  if (!holdValue.isPositive()) return undefined;

  return {
    positionValue,
    holdValue,
    deltaVsHold: positionValue.quo(holdValue).sub(new Dec(1)),
  };
}
