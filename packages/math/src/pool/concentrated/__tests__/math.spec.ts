import { Dec } from "@keplr-wallet/unit";

import { smallestDec } from "../const";
import {
  approxRoot,
  calcAmount0Delta,
  calcAmount1Delta,
  getFeeChargePerSwapStepOutGivenIn,
  getNextSqrtPriceFromAmount0InRoundingUp,
  getNextSqrtPriceFromAmount0OutRoundingUp,
  getNextSqrtPriceFromAmount1InRoundingDown,
  getNextSqrtPriceFromAmount1OutRoundingDown,
} from "../math";

describe("calcAmount0Delta", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L156
  it("matches chain code test", () => {
    const sqrtPriceA = new Dec("70.710678118654752440");
    const sqrtPriceB = new Dec("74.161984870956629487");
    const liquidity = new Dec("1517882343.751510418088349649");

    const res = calcAmount0Delta(liquidity, sqrtPriceA, sqrtPriceB, false);

    expect(res.toString()).toBe("998976.618347426388356620");
  });
});

describe("calcAmount1Delta", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L186
  it("matches chain code test", () => {
    const sqrtPriceA = new Dec("70.710678118654752440");
    const sqrtPriceB = new Dec("67.416615162732695594");
    const liquidity = new Dec("1517882343.751510418088349649");

    const res = calcAmount1Delta(liquidity, sqrtPriceA, sqrtPriceB, false);

    expect(res.toString()).toBe("5000000000.000000000000000000");
  });
});

describe("getNextSqrtPriceFromAmount0InRoundingUp", () => {
  // https://www.github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L96
  it("matches chain code test", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("1517882343.751510418088349649");
    const amountRemaining = new Dec(13370);

    const res = getNextSqrtPriceFromAmount0InRoundingUp(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.666663910857144332");
  });

  it("returns current price if amount remaining is zero", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("1517882343.751510418088349649");
    const amountRemaining = new Dec(0);

    const res = getNextSqrtPriceFromAmount0InRoundingUp(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.710678118654752440");
  });
});

describe("getNextSqrtPriceFromAmount1InRoundingDown", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L126
  it("matches chain code test", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("1519437308.014768571721000000");
    const amountRemaining = new Dec(42000000);

    const res = getNextSqrtPriceFromAmount1InRoundingDown(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.738319930382329008");
  });

  // more
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L325
  it("matches chain code test -- rounded down at precision end", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("3035764687.503020836176699298");
    const amountRemaining = new Dec("8398");

    const res = getNextSqrtPriceFromAmount1InRoundingDown(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.710680885008822823");
  });
  it("matches chain code test -- no round up due zeroes at precision end", () => {
    const sqrtPriceCurrent = new Dec("2.5");
    const liquidity = new Dec("1");
    const amountRemaining = new Dec("10");

    const res = getNextSqrtPriceFromAmount1InRoundingDown(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("12.500000000000000000");
  });
});

describe("getNextSqrtPriceFromAmount0OutRoundingUp", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L288
  it("matches chain code test -- rounded up at precision end", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("3035764687.503020836176699298");
    const amountRemaining = new Dec("8398");

    const res = getNextSqrtPriceFromAmount0OutRoundingUp(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.724512595179305566");
  });
  it("matches chain code test -- no round up due zeroes at precision end", () => {
    const sqrtPriceCurrent = new Dec("2");
    const liquidity = new Dec("10");
    const amountRemaining = new Dec("1");

    const res = getNextSqrtPriceFromAmount0OutRoundingUp(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("2.500000000000000000");
  });
});

describe("getNextsqrtPriceFromAmount1OutRoundingDown", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/math/math_test.go#L362
  it("matches chain code test -- rounded down at precision end", () => {
    const sqrtPriceCurrent = new Dec("70.710678118654752440");
    const liquidity = new Dec("3035764687.503020836176699298");
    const amountRemaining = new Dec("8398");

    const res = getNextSqrtPriceFromAmount1OutRoundingDown(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("70.710675352300682056");
  });
  it("matches chain code test -- no round up due zeroes at precision end", () => {
    const sqrtPriceCurrent = new Dec("12.5");
    const liquidity = new Dec("1");
    const amountRemaining = new Dec("10");

    const res = getNextSqrtPriceFromAmount1OutRoundingDown(
      sqrtPriceCurrent,
      liquidity,
      amountRemaining
    );

    expect(res.toString()).toBe("2.500000000000000000");
  });
});

describe("getFeeChargePerSwapStepOutGivenIn", () => {
  // https://github.com/osmosis-labs/osmosis/blob/fffe3a2ad32a8c51d654212e70dfa1e8eff5f323/x/concentrated-liquidity/internal/swapstrategy/fees_test.go#L14
  it("matches chain code test -- reached target -> charge fee on amount in", () => {
    const hasReachedTarget = true;
    const amountIn = new Dec(100);
    const amountSpecifiedRemaining = new Dec(5);
    const fee = new Dec("0.01");

    const res = getFeeChargePerSwapStepOutGivenIn(
      hasReachedTarget,
      amountIn,
      amountSpecifiedRemaining,
      fee
    );

    const expectedRes = new Dec(100).mul(fee).quo(new Dec(1).sub(fee));
    expect(res.toString()).toBe(expectedRes.toString());
  });
  it("matches chain code test -- did not reach target -> charge fee on the difference between amount remaining and amount in", () => {
    const hasReachedTarget = false;
    const amountIn = new Dec(5);
    const amountSpecifiedRemaining = new Dec(100);
    const fee = new Dec("0.01");

    const res = getFeeChargePerSwapStepOutGivenIn(
      hasReachedTarget,
      amountIn,
      amountSpecifiedRemaining,
      fee
    );

    expect(res.toString()).toBe("95.000000000000000000");
  });
  it("matches chain code test -- zero swap fee", () => {
    const hasReachedTarget = true;
    const amountIn = new Dec(5);
    const amountSpecifiedRemaining = new Dec(100);
    const fee = new Dec(0);

    const res = getFeeChargePerSwapStepOutGivenIn(
      hasReachedTarget,
      amountIn,
      amountSpecifiedRemaining,
      fee
    );

    expect(res.isZero()).toBeTruthy();
  });
  it("matches chain code test -- panic", () => {
    const hasReachedTarget = false;
    const amountIn = new Dec(100);
    const amountSpecifiedRemaining = new Dec(5);
    const fee = new Dec("0.01").neg();

    expect(() => {
      getFeeChargePerSwapStepOutGivenIn(
        hasReachedTarget,
        amountIn,
        amountSpecifiedRemaining,
        fee
      );
    }).toThrow();
  });
  it("matches chain code test -- amount specified remaining < amount in leads to negative fee - panic", () => {
    const hasReachedTarget = false;
    const amountIn = new Dec(102);
    const amountSpecifiedRemaining = new Dec(101);
    const fee = new Dec("0.01");

    expect(() => {
      getFeeChargePerSwapStepOutGivenIn(
        hasReachedTarget,
        amountIn,
        amountSpecifiedRemaining,
        fee
      );
    }).toThrow();
  });
});

describe("Dec approxRoot", () => {
  // from: https://github.com/osmosis-labs/cosmos-sdk/blob/5b0f9cfa4331ad3c64d9690318e4621b569b9a50/types/decimal_test.go#L372)
  it("matches chain code test", () => {
    const tests: { d: Dec; r: number; res: Dec }[] = [
      { d: new Dec(1), r: 10, res: new Dec(1) }, // 1.0 ^ (0.1) => 1.0
      { d: new Dec(25, 2), r: 2, res: new Dec(5, 1) }, // 0.25 ^ (0.5) => 0.5,
      { d: new Dec(4, 2), r: 2, res: new Dec(2, 1) }, // 0.04 ^ (0.5) => 0.2
      { d: new Dec(27), r: 3, res: new Dec(3) }, // 27 ^ (1/3) => 3
      { d: new Dec(-81), r: 4, res: new Dec(-3) }, // -81 ^ (0.25) => -3
      { d: new Dec(2), r: 2, res: new Dec("1414213562373095049", 18) }, // 2 ^ (0.5) => 1.414213562373095049
      {
        d: new Dec(1005, 3),
        r: 31536000,
        res: new Dec("1.000000000158153904"),
      }, // 1.005 ^ (1/31536000) ≈ 1.00000000016
      { d: smallestDec, r: 2, res: new Dec(1, 9) }, // 1e-18 ^ (0.5) => 1e-9
      { d: smallestDec, r: 3, res: new Dec("0.000000999999999997") }, // 1e-18 ^ (1/3) => 1e-6
      { d: new Dec(1, 8), r: 3, res: new Dec("0.002154434690031900") }, // 1e-8 ^ (1/3) ≈ 0.00215443469
    ];

    for (const test of tests) {
      const res = approxRoot(test.d, test.r);

      expect(res.toString()).toBe(test.res.toString());
    }
  });
});
