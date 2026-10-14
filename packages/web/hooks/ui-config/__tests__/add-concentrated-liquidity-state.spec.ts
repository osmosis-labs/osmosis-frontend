import { BigDec, maxTick, minTick } from "@osmosis-labs/math";
import { Dec, Int } from "@osmosis-labs/unit";

import {
  addConcentratedLiquidityReducer,
  calcHistoricalPriceRange,
  calcTickRange,
  deriveRangeView,
  getQuoteOverBaseMultiplier,
  INITIAL_ADD_CL_STATE,
  priceInputToDec,
  reducePriceInput,
} from "../add-concentrated-liquidity-state";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const wbtc = { coinDenom: "WBTC", coinMinimalDenom: "wbtc", coinDecimals: 8 };

const pool = (sqrtPrice: string) => ({
  baseCurrency: osmo,
  quoteCurrency: osmo,
  currentSqrtPrice: new BigDec(sqrtPrice),
  tickSpacing: 100,
});

const rangeInputs = (
  overrides: Partial<Parameters<typeof deriveRangeView>[0]> = {}
) => ({
  fullRange: false,
  minInput: "0.5",
  maxInput: "2",
  baseCurrency: osmo,
  quoteCurrency: osmo,
  pool: pool("1"),
  minHistoricalPrice: null,
  maxHistoricalPrice: null,
  ...overrides,
});

describe("price input", () => {
  it("normalizes typed values", () => {
    expect(reducePriceInput("1", "")).toBe("0");
    expect(reducePriceInput("1", "  ")).toBe("0");
    expect(reducePriceInput("1", ".5")).toBe("0.5");
    expect(reducePriceInput("1", "2.")).toBe("2.");
    expect(reducePriceInput("1", "abc")).toBe("1");
  });

  it("removes currency decimals for computation", () => {
    const mult = getQuoteOverBaseMultiplier(wbtc, osmo); // 10^2
    expect(priceInputToDec("200", mult).toString()).toBe(new Dec(2).toString());
    expect(
      priceInputToDec("2.", getQuoteOverBaseMultiplier(osmo, osmo))
    ).toEqual(new Dec(2));
    expect(
      priceInputToDec(".", getQuoteOverBaseMultiplier(osmo, osmo))
    ).toEqual(new Dec(0));
  });
});

describe("deriveRangeView", () => {
  it("uses min/max ticks for full range", () => {
    const v = deriveRangeView(rangeInputs({ fullRange: true }));
    expect(v.tickRange[0].equals(minTick)).toBe(true);
    expect(v.tickRange[1].equals(maxTick)).toBe(true);
    expect(v.currentStrategy).toBe("passive");
    expect(v.baseDepositOnly).toBe(false);
    expect(v.quoteDepositOnly).toBe(false);
    // display upper bound is twice the current price
    expect(v.rangeWithCurrencyDecimals[1].equals(new Dec(2))).toBe(true);
  });

  it("is a custom strategy for an arbitrary range", () => {
    const v = deriveRangeView(rangeInputs());
    expect(v.currentStrategy).toBeNull();
    expect(v.rangeRaw).toEqual(["0.5", "2"]);
    expect(v.tickRange[0].lt(v.tickRange[1])).toBe(true);
  });

  it("is single sided when the price is out of range", () => {
    // current price 1; range entirely above -> only base is deposited
    const above = deriveRangeView(
      rangeInputs({ minInput: "1.5", maxInput: "2" })
    );
    expect(above.baseDepositOnly).toBe(true);
    expect(above.quoteDepositOnly).toBe(false);
    // range entirely below -> only quote
    const below = deriveRangeView(
      rangeInputs({ minInput: "0.5", maxInput: "0.8" })
    );
    expect(below.quoteDepositOnly).toBe(true);
    expect(below.baseDepositOnly).toBe(false);
  });

  it("is not single sided without a pool price", () => {
    const v = deriveRangeView(rangeInputs({ pool: null }));
    expect(v.baseDepositOnly).toBe(false);
    expect(v.quoteDepositOnly).toBe(false);
    expect(v.tickRange[0].equals(minTick)).toBe(true);
  });

  it("clamps the range to 50x of the current price", () => {
    const v = deriveRangeView(
      rangeInputs({ minInput: "0.001", maxInput: "1000" })
    );
    expect(v.range[0].equals(new Dec(1).quo(new Dec(50)))).toBe(true);
    expect(v.range[1].equals(new Dec(50))).toBe(true);
  });

  it("falls back to default presets without historical prices", () => {
    const v = deriveRangeView(rangeInputs());
    expect(v.moderatePriceRange[0].equals(new Dec(0.1))).toBe(true);
    expect(v.aggressivePriceRange[1].equals(new Dec(100))).toBe(true);
  });

  it("detects the moderate and aggressive presets", () => {
    const base = rangeInputs({
      minHistoricalPrice: 0.9,
      maxHistoricalPrice: 1.1,
    });
    const preset = deriveRangeView(base);
    const moderate = deriveRangeView({
      ...base,
      minInput: preset.moderatePriceRange[0].toString(),
      maxInput: preset.moderatePriceRange[1].toString(),
    });
    expect(moderate.currentStrategy).toBe("moderate");
    const aggressive = deriveRangeView({
      ...base,
      minInput: preset.aggressivePriceRange[0].toString(),
      maxInput: preset.aggressivePriceRange[1].toString(),
    });
    expect(aggressive.currentStrategy).toBe("aggressive");
    expect(
      preset.moderatePriceRange[0].lt(preset.aggressivePriceRange[0])
    ).toBe(true);
  });

  it("includes currency decimals in the current price", () => {
    const v = deriveRangeView(
      rangeInputs({
        baseCurrency: wbtc,
        quoteCurrency: osmo,
        pool: { ...pool("1"), baseCurrency: wbtc },
      })
    );
    expect(v.currentPrice.equals(new Dec(1))).toBe(true);
    expect(v.currentPriceWithDecimals.equals(new Dec(100))).toBe(true);
  });
});

describe("calcHistoricalPriceRange", () => {
  it("widens the range by the multiplier of the spread", () => {
    const [lo, hi] = calcHistoricalPriceRange({
      min: 1,
      max: 2,
      multiplier: 0.25,
      quoteOverBase: new Dec(1),
      tickSpacing: 100,
    });
    expect(lo.lte(new Dec(0.75))).toBe(true);
    expect(lo.gt(new Dec(0.7))).toBe(true);
    expect(hi.gte(new Dec(2.25))).toBe(true);
    expect(hi.lt(new Dec(2.3))).toBe(true);
  });
});

describe("calcTickRange", () => {
  it("pads when both ends round to the same tick", () => {
    const [lo, hi] = calcTickRange([new Dec(1), new Dec(1)], new Int(100));
    expect(hi.sub(lo).equals(new Int(200))).toBe(true);
  });
});

describe("addConcentratedLiquidityReducer", () => {
  const reduce = addConcentratedLiquidityReducer;

  it("setting a range leaves full range", () => {
    let s = reduce(INITIAL_ADD_CL_STATE, { type: "setFullRange", value: true });
    s = reduce(s, { type: "setMinRange", value: ".5" });
    expect(s.fullRange).toBe(false);
    expect(s.minInput).toBe("0.5");
    // invalid input is ignored
    expect(reduce(s, { type: "setMaxRange", value: "x" }).maxInput).toBe("0");
  });

  it("max anchors the side and releases the other", () => {
    let s = reduce(INITIAL_ADD_CL_STATE, { type: "setMax", side: "quote" });
    expect(s.anchor).toBe("quote");
    expect(s.quote.fraction).toBe(1);
    s = reduce(s, { type: "setMax", side: "base" });
    expect(s.anchor).toBe("base");
    expect(s.base.fraction).toBe(1);
    expect(s.quote.fraction).toBeUndefined();
  });

  it("typing clears the fraction and is idempotent", () => {
    let s = reduce(INITIAL_ADD_CL_STATE, { type: "setMax", side: "base" });
    s = reduce(s, { type: "setAmount", side: "base", amount: ".5" });
    expect(s.base).toEqual({ amount: "0.5", fraction: undefined });
    expect(reduce(s, { type: "setAmount", side: "base", amount: "0.5" })).toBe(
      s
    );
  });

  it("initRange sets both ends and marks initialized", () => {
    const s = reduce(INITIAL_ADD_CL_STATE, {
      type: "initRange",
      min: "1",
      max: "3",
    });
    expect(s).toMatchObject({
      minInput: "1",
      maxInput: "3",
      fullRange: false,
      rangeInitialized: true,
    });
  });
});
