import { Dec, Int } from "@osmosis-labs/unit";

import {
  computeDepthChartData,
  computeXRange,
  computeYRange,
  getCurrentPrice,
  getLiqFrom,
  getPriceDecimal,
  getQuoteOverBaseMultiplier,
  isEmptyConcentratedPool,
} from "../historical-and-depth-math";

const clPool = (sqrtPrice: string | undefined) =>
  ({ type: "concentrated", raw: { current_sqrt_price: sqrtPrice } }) as any;

describe("isEmptyConcentratedPool", () => {
  it("is false for non-concentrated or missing pools", () => {
    expect(isEmptyConcentratedPool(undefined)).toBe(false);
    expect(isEmptyConcentratedPool({ type: "weighted" } as any)).toBe(false);
  });

  it("is true for a missing or zero sqrt price", () => {
    expect(isEmptyConcentratedPool(clPool(undefined))).toBe(true);
    expect(isEmptyConcentratedPool(clPool(""))).toBe(true);
    expect(isEmptyConcentratedPool(clPool("0.000000000000000000"))).toBe(true);
  });

  it("is false for a positive or unparsable sqrt price", () => {
    expect(isEmptyConcentratedPool(clPool("1.5"))).toBe(false);
    expect(isEmptyConcentratedPool(clPool("not-a-number"))).toBe(false);
  });
});

describe("getQuoteOverBaseMultiplier / getCurrentPrice", () => {
  it("scales by the decimals difference", () => {
    expect(getQuoteOverBaseMultiplier(6, 6).equals(new Dec(1))).toBe(true);
    expect(getQuoteOverBaseMultiplier(8, 6).equals(new Dec(100))).toBe(true);
    expect(getQuoteOverBaseMultiplier(6, 8).equals(new Dec("0.01"))).toBe(true);
    expect(
      getQuoteOverBaseMultiplier(undefined, undefined).equals(new Dec(1))
    ).toBe(true);
  });

  it("squares the sqrt price and applies the multiplier", () => {
    const price = getCurrentPrice(clPool("2"), new Dec(10));
    expect(price.equals(new Dec(40))).toBe(true);
  });

  it("is zero without a concentrated pool or sqrt price", () => {
    expect(getCurrentPrice(null, new Dec(1)).isZero()).toBe(true);
    expect(
      getCurrentPrice({ type: "weighted" } as any, new Dec(1)).isZero()
    ).toBe(true);
    expect(getCurrentPrice(clPool(undefined), new Dec(1)).isZero()).toBe(true);
  });
});

describe("getPriceDecimal", () => {
  it.each([
    [undefined, 2],
    [0.0005, 5],
    [0.001, 5],
    [0.005, 4],
    [0.01, 4],
    [0.05, 3],
    [0.1, 3],
    [0.5, 3],
    [1, 2],
    [250, 2],
  ])("close %s -> %s", (close, expected) => {
    expect(getPriceDecimal(close)).toBe(expected);
  });
});

describe("computeYRange", () => {
  const range = null;

  it("pads the data extent by 10% when not zoomed beyond it", () => {
    const [min, max] = computeYRange({
      prices: [10, 20],
      currentPrice: new Dec(15),
      range,
      zoom: 1,
    });
    expect(min).toBeCloseTo(9);
    expect(max).toBeCloseTo(21);
  });

  it("widens by zoom when that exceeds the padding", () => {
    const [min, max] = computeYRange({
      prices: [10, 20],
      currentPrice: new Dec(15),
      range,
      zoom: 1.5,
    });
    expect(min).toBeCloseTo(10 / 1.5);
    expect(max).toBeCloseTo(30);
  });

  it("zooms below 1 by multiplying the minimum", () => {
    const [min] = computeYRange({
      prices: [10, 20],
      currentPrice: new Dec(15),
      range,
      zoom: 0.5,
    });
    // 10 * 0.5 = 5 < padded 9
    expect(min).toBeCloseTo(5);
  });

  it("falls back to +-20% of the current price without history", () => {
    const [min, max] = computeYRange({
      prices: [],
      currentPrice: new Dec(100),
      range,
      zoom: 1,
    });
    expect(min).toBeCloseTo(76);
    expect(max).toBeCloseTo(124);
  });

  it("includes the selected range in the extent", () => {
    const [min, max] = computeYRange({
      prices: [10, 20],
      currentPrice: new Dec(15),
      range: [new Dec(5), new Dec(40)],
      zoom: 1,
    });
    // extent 5..40, delta 35, padding 3.5
    expect(min).toBeCloseTo(1.5);
    expect(max).toBeCloseTo(43.5);
  });

  it("never returns a negative minimum from padding", () => {
    const [min] = computeYRange({
      prices: [0.1, 100],
      currentPrice: new Dec(1),
      range,
      zoom: 1,
    });
    expect(min).toBe(0);
  });
});

describe("getLiqFrom / computeDepthChartData / computeXRange", () => {
  const range = (lower: number, upper: number, liquidity: number) =>
    ({
      lowerTick: new Int(lower),
      upperTick: new Int(upper),
      liquidityAmount: new Dec(liquidity),
    }) as any;

  it("finds the liquidity of the range containing a tick", () => {
    const list = [range(0, 10, 5), range(11, 20, 7)];
    expect(getLiqFrom(new Int(10), list)).toBe(5);
    expect(getLiqFrom(new Int(11), list)).toBe(7);
    expect(getLiqFrom(new Int(25), list)).toBe(0);
  });

  it("returns nothing for an empty domain", () => {
    expect(
      computeDepthChartData({
        activeLiquidity: [],
        yRange: [1, 1],
        quoteOverBase: new Dec(1),
      })
    ).toEqual([]);
  });

  it("samples 21 prices across the domain", () => {
    const result = computeDepthChartData({
      activeLiquidity: [],
      yRange: [1, 2],
      quoteOverBase: new Dec(1),
    });
    expect(result.length).toBeGreaterThanOrEqual(20);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result[0].price).toBe(1);
    expect(result.every((d) => d.depth === 0)).toBe(true);
  });

  it("computes the x domain from the deepest sample", () => {
    expect(computeXRange([])).toEqual([0, 0]);
    expect(
      computeXRange([
        { price: 1, depth: 10 },
        { price: 2, depth: 50 },
      ])
    ).toEqual([0, 60]);
  });
});
