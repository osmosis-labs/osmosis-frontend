import { clAmountsInPriceInterval, clQuantitiesOnLevels } from "../cl-depth";

// One range between raw prices 1 and 4 (sqrt 1 and 2) with liquidity 1e6,
// pool price 2.25 (sqrt 1.5). Above the price: token0 = L(1/1.5 - 1/2).
// Below it: token1 = L(1.5 - 1).
const range = { lowerSqrtPrice: 1, upperSqrtPrice: 2, liquidity: 1e6 };
const token0Above = 1e6 * (1 / 1.5 - 1 / 2);
const token1Below = 1e6 * (1.5 - 1);
// What each held amount trades for across its part of the range: the token0
// that swapping into the token1 below takes, and the token1 that the token0
// above takes.
const token1BelowAs0 = 1e6 * (1 / 1 - 1 / 1.5);
const token0AboveAs1 = 1e6 * (2 - 1.5);

describe("clAmountsInPriceInterval", () => {
  it("splits a range at the current price into token0 above and token1 below", () => {
    const { amount0, amount1 } = clAmountsInPriceInterval({
      ranges: [range],
      currentSqrtPrice: 1.5,
      loPrice: 0.5,
      hiPrice: 10,
    });
    expect(amount0).toBeCloseTo(token0Above, 6);
    expect(amount1).toBeCloseTo(token1Below, 6);
  });

  it("gives what each held amount trades for across the interval", () => {
    const { amount0As1, amount1As0 } = clAmountsInPriceInterval({
      ranges: [range],
      currentSqrtPrice: 1.5,
      loPrice: 0.5,
      hiPrice: 10,
    });
    expect(amount0As1).toBeCloseTo(token0AboveAs1, 6);
    expect(amount1As0).toBeCloseTo(token1BelowAs0, 6);
  });

  it("only counts the part of a range inside the interval", () => {
    // Raw prices 2.25 to 3.0625 (sqrt 1.5 to 1.75), all above the price.
    const { amount0, amount1 } = clAmountsInPriceInterval({
      ranges: [range],
      currentSqrtPrice: 1.5,
      loPrice: 2.25,
      hiPrice: 3.0625,
    });
    expect(amount0).toBeCloseTo(1e6 * (1 / 1.5 - 1 / 1.75), 6);
    expect(amount1).toBe(0);
  });
});

describe("clQuantitiesOnLevels", () => {
  it("puts base above the mid on asks and quote below on bids (6/6 decimals)", () => {
    const { asks, bids } = clQuantitiesOnLevels({
      pools: [{ ranges: [range], currentSqrtPrice: 1.5, token0IsBase: true }],
      midPrice: 2.25,
      askPrices: [4],
      bidPrices: [1],
      baseDecimals: 6,
      quoteDecimals: 6,
    });
    expect(asks[0]).toBeCloseTo(token0Above / 1e6, 9);
    // The base the quote buys between the mid and the level, not the quote
    // divided by the level's price (token1Below / 1), which overstates it.
    expect(bids[0]).toBeCloseTo(token1BelowAs0 / 1e6, 9);
  });

  it("scales each side by its own decimals (8-decimal base, 6-decimal quote)", () => {
    // Human price = raw * 10^(8 - 6), so raw 1..4 is human 100..400.
    const { asks, bids } = clQuantitiesOnLevels({
      pools: [{ ranges: [range], currentSqrtPrice: 1.5, token0IsBase: true }],
      midPrice: 225,
      askPrices: [400],
      bidPrices: [100],
      baseDecimals: 8,
      quoteDecimals: 6,
    });
    expect(asks[0]).toBeCloseTo(token0Above / 1e8, 12);
    expect(bids[0]).toBeCloseTo(token1BelowAs0 / 1e8, 12);
  });

  it("inverts prices when the pool lists the book's quote as token0", () => {
    // Pool raw price is base per quote; book price is its inverse, so the
    // pool's range 1..4 is book prices 0.25..1 and its price 2.25 is
    // 1 / 2.25 on the book. token1 (base) sits above the book price,
    // token0 (quote) below it.
    const { asks, bids } = clQuantitiesOnLevels({
      pools: [{ ranges: [range], currentSqrtPrice: 1.5, token0IsBase: false }],
      midPrice: 1 / 2.25,
      askPrices: [1],
      bidPrices: [0.25],
      baseDecimals: 6,
      quoteDecimals: 6,
    });
    expect(asks[0]).toBeCloseTo(token1Below / 1e6, 9);
    expect(bids[0]).toBeCloseTo(token0AboveAs1 / 1e6, 9);
  });

  it("gives each level only the liquidity since the previous level", () => {
    const { asks } = clQuantitiesOnLevels({
      pools: [{ ranges: [range], currentSqrtPrice: 1.5, token0IsBase: true }],
      midPrice: 2.25,
      askPrices: [3.0625, 4],
      bidPrices: [],
      baseDecimals: 6,
      quoteDecimals: 6,
    });
    expect(asks[0]).toBeCloseTo((1e6 * (1 / 1.5 - 1 / 1.75)) / 1e6, 9);
    expect(asks[1]).toBeCloseTo((1e6 * (1 / 1.75 - 1 / 2)) / 1e6, 9);
    expect(asks[0] + asks[1]).toBeCloseTo(token0Above / 1e6, 9);
  });
});
