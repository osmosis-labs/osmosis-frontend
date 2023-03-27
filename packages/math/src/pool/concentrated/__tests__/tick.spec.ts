import { Dec } from "@keplr-wallet/unit";

import {
  calculatePriceAndTicksPassed,
  computeMinMaxTicksFromExponentAtPriceOne,
} from "../tick";

// https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/internal/math/tick_test.go#L358
describe("computeMinMaxTicksFromExponentAtPriceOne", () => {
  it("exponetAtPriceOne -1", () => {
    const exponetAtPriceOne = -1;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponetAtPriceOne);
    expect(minTick.toString()).toEqual("-1620");
    expect(maxTick.toString()).toEqual("3420");
  });
  it("exponetAtPriceOne -6", () => {
    const exponetAtPriceOne = -6;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponetAtPriceOne);
    expect(minTick.toString()).toEqual("-162000000");
    expect(maxTick.toString()).toEqual("342000000");
  });
  it("exponetAtPriceOne -12", () => {
    const exponetAtPriceOne = -12;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponetAtPriceOne);
    expect(minTick.toString()).toEqual("-162000000000000");
    expect(maxTick.toString()).toEqual("342000000000000");
  });
  it("exponetAtPriceOne -13", () => {
    const exponetAtPriceOne = -13;
    const { minTick, maxTick } =
      computeMinMaxTicksFromExponentAtPriceOne(exponetAtPriceOne);
    expect(minTick.toString()).toEqual("-1620000000000000");
    expect(maxTick.toString()).toEqual("3420000000000000");
  });
});

// https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/internal/math/tick_test.go#L325
describe("calculatePriceAndTicksPassed", () => {
  it("price > 1", () => {
    const price = new Dec("9.78");
    const exponentAtPriceOne = -5;

    const { currentPrice, ticksPassed, currentAdditiveIncrementInTicks } =
      calculatePriceAndTicksPassed(price, exponentAtPriceOne);

    expect(currentPrice.toString()).toEqual("10.000000000000000000");
    expect(ticksPassed.toString()).toEqual("900000");
    expect(currentAdditiveIncrementInTicks.toString()).toEqual(
      "0.000010000000000000000000000000000000"
    );
  });
  it("price < 1", () => {
    const price = new Dec("0.71");
    const exponentAtPriceOne = -6;

    const { currentPrice, ticksPassed, currentAdditiveIncrementInTicks } =
      calculatePriceAndTicksPassed(price, exponentAtPriceOne);

    expect(currentPrice.toString()).toEqual("0.100000000000000000");
    expect(ticksPassed.toString()).toEqual("-9000000");
    expect(currentAdditiveIncrementInTicks.toString()).toEqual(
      "0.000000100000000000000000000000000000"
    );
  });
});
