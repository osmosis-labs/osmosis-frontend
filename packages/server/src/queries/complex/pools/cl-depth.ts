/**
 * Concentrated-liquidity depth on orderbook price levels.
 *
 * CL liquidity is continuous over each tick range, so it is integrated over
 * price intervals rather than sampled at points. All CL maths here is in the
 * pool's own raw orientation: price is token1 per token0 in minimal units,
 * and sqrt prices are square roots of that.
 */

export type ClTickRange = {
  lowerSqrtPrice: number;
  upperSqrtPrice: number;
  /** Active liquidity across the range. */
  liquidity: number;
};

/**
 * Token amounts (minimal units) held by the ranges within the raw price
 * interval [loPrice, hiPrice], split at the pool's current price: token0 sits
 * above the current price and token1 below it.
 *
 * For a range with liquidity L between sqrt prices a < b:
 *   amount0 = L * (1 / a - 1 / b)
 *   amount1 = L * (b - a)
 *
 * Each held amount also comes with what it trades for across its part of
 * the interval: `amount1As0` is the token0 that swapping into the token1
 * below the price takes, and `amount0As1` the token1 that the token0 above
 * it takes. Converting at one price instead would be wrong across a wide
 * interval.
 */
export function clAmountsInPriceInterval({
  ranges,
  currentSqrtPrice,
  loPrice,
  hiPrice,
}: {
  ranges: ClTickRange[];
  currentSqrtPrice: number;
  loPrice: number;
  hiPrice: number;
}): {
  amount0: number;
  amount1: number;
  amount0As1: number;
  amount1As0: number;
} {
  const none = { amount0: 0, amount1: 0, amount0As1: 0, amount1As0: 0 };
  if (!(hiPrice > loPrice) || loPrice < 0) return none;
  const lo = Math.sqrt(loPrice);
  const hi = Math.sqrt(hiPrice);

  const out = { ...none };
  for (const { lowerSqrtPrice, upperSqrtPrice, liquidity } of ranges) {
    if (!(liquidity > 0)) continue;
    const a = Math.max(lowerSqrtPrice, lo);
    const b = Math.min(upperSqrtPrice, hi);
    if (!(b > a)) continue;

    // Part above the current price holds token0.
    const a0 = Math.max(a, currentSqrtPrice);
    if (b > a0) {
      out.amount0 += liquidity * (1 / a0 - 1 / b);
      out.amount0As1 += liquidity * (b - a0);
    }

    // Part below the current price holds token1.
    const b1 = Math.min(b, currentSqrtPrice);
    if (b1 > a) {
      out.amount1 += liquidity * (b1 - a);
      out.amount1As0 += liquidity * (1 / a - 1 / b1);
    }
  }
  return out;
}

export type ClPoolDepthInput = {
  ranges: ClTickRange[];
  currentSqrtPrice: number;
  /** True when the pool's token0 is the book's base denom. */
  token0IsBase: boolean;
};

/**
 * CL liquidity, in human base amounts, for each orderbook level.
 *
 * Each level covers the interval from the previous level (or the mid price,
 * for the best level) out to its own price, so cumulative CL depth at a
 * level is all CL liquidity between the mid price and that level. Asks take
 * the base asset held above the pool price; bids take the quote asset held
 * below it, as the base it buys across the interval.
 *
 * Prices are human book prices (quote per base); `quoteDecimals -
 * baseDecimals` converts them to raw book prices.
 */
export function clQuantitiesOnLevels({
  pools,
  midPrice,
  bidPrices,
  askPrices,
  baseDecimals,
  quoteDecimals,
}: {
  pools: ClPoolDepthInput[];
  midPrice: number;
  /** Best first (descending). */
  bidPrices: number[];
  /** Best first (ascending). */
  askPrices: number[];
  baseDecimals: number;
  quoteDecimals: number;
}): { bids: number[]; asks: number[] } {
  const rawFactor = Math.pow(10, quoteDecimals - baseDecimals);
  const baseScale = Math.pow(10, baseDecimals);

  /**
   * Base minimal amounts in the human book interval [lo, hi]: the base held
   * above the pool price (asks), and the base the quote held below it buys
   * (bids).
   */
  const amountsIn = (lo: number, hi: number) => {
    let askBase = 0;
    let bidBase = 0;
    if (!(hi > lo) || lo <= 0) return { askBase, bidBase };
    for (const { ranges, currentSqrtPrice, token0IsBase } of pools) {
      const bookLo = lo * rawFactor;
      const bookHi = hi * rawFactor;
      // The pool's raw price is the book's raw price, or its inverse when the
      // pool lists the book's quote as token0.
      const { amount0, amount1, amount0As1, amount1As0 } =
        clAmountsInPriceInterval({
          ranges,
          currentSqrtPrice,
          loPrice: token0IsBase ? bookLo : 1 / bookHi,
          hiPrice: token0IsBase ? bookHi : 1 / bookLo,
        });
      askBase += token0IsBase ? amount0 : amount1;
      bidBase += token0IsBase ? amount1As0 : amount0As1;
    }
    return { askBase, bidBase };
  };

  let prevAsk = midPrice;
  const asks = askPrices.map((price) => {
    const { askBase } = amountsIn(prevAsk, price);
    prevAsk = Math.max(prevAsk, price);
    return askBase / baseScale;
  });

  let prevBid = midPrice;
  const bids = bidPrices.map((price) => {
    const { bidBase } = amountsIn(price, prevBid);
    prevBid = Math.min(prevBid, price);
    return bidBase / baseScale;
  });

  return { bids, asks };
}
