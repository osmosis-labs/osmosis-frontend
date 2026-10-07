import { Int } from "@osmosis-labs/unit";

import { BigDec } from "../big-dec";

// 36 zeros: the fractional part BigDec renders for an integer value.
const ZEROS = "0".repeat(BigDec.precision);

describe("BigDec JSON serialization", () => {
  it("serializes as a decimal string", () => {
    expect(JSON.stringify(new BigDec("1.5"))).toBe(`"1.5${"0".repeat(35)}"`);
  });
});

describe("BigDec arithmetic at 36 decimals", () => {
  it("has 36 digits of precision", () => {
    expect(BigDec.precision).toBe(36);
    expect(new BigDec(1).toString()).toBe(`1.${ZEROS}`);
    expect(new BigDec(1).toString().split(".")[1]).toHaveLength(36);
  });

  it("should be calculated properly", () => {
    const tests: {
      d1: BigDec;
      d2: BigDec;
      expMul: BigDec;
      expMulTruncate: BigDec;
      expQuo: BigDec;
      expQuoRoundUp: BigDec;
      expQuoTruncate: BigDec;
      expAdd: BigDec;
      expSub: BigDec;
    }[] = [
      {
        d1: new BigDec(0),
        d2: new BigDec(0),
        expMul: new BigDec(0),
        expMulTruncate: new BigDec(0),
        expQuo: new BigDec(0),
        expQuoRoundUp: new BigDec(0),
        expQuoTruncate: new BigDec(0),
        expAdd: new BigDec(0),
        expSub: new BigDec(0),
      },
      {
        d1: new BigDec(0),
        d2: new BigDec(1),
        expMul: new BigDec(0),
        expMulTruncate: new BigDec(0),
        expQuo: new BigDec(0),
        expQuoRoundUp: new BigDec(0),
        expQuoTruncate: new BigDec(0),
        expAdd: new BigDec(1),
        expSub: new BigDec(-1),
      },
      {
        d1: new BigDec(-1),
        d2: new BigDec(0),
        expMul: new BigDec(0),
        expMulTruncate: new BigDec(0),
        expQuo: new BigDec(0),
        expQuoRoundUp: new BigDec(0),
        expQuoTruncate: new BigDec(0),
        expAdd: new BigDec(-1),
        expSub: new BigDec(-1),
      },
      {
        d1: new BigDec(-1),
        d2: new BigDec(1),
        expMul: new BigDec(-1),
        expMulTruncate: new BigDec(-1),
        expQuo: new BigDec(-1),
        expQuoRoundUp: new BigDec(-1),
        expQuoTruncate: new BigDec(-1),
        expAdd: new BigDec(0),
        expSub: new BigDec(-2),
      },
      {
        // 3/7 = 0.(428571); the 37th digit is a 4, so round and truncate agree.
        d1: new BigDec(3),
        d2: new BigDec(7),
        expMul: new BigDec(21),
        expMulTruncate: new BigDec(21),
        expQuo: new BigDec(`0.${"428571".repeat(6)}`),
        expQuoRoundUp: new BigDec(`0.${"428571".repeat(5)}428572`),
        expQuoTruncate: new BigDec(`0.${"428571".repeat(6)}`),
        expAdd: new BigDec(10),
        expSub: new BigDec(-4),
      },
      {
        // 1/3 = 0.(3); the 37th digit is a 3, so round and truncate agree.
        d1: new BigDec(1),
        d2: new BigDec(3),
        expMul: new BigDec(3),
        expMulTruncate: new BigDec(3),
        expQuo: new BigDec(`0.${"3".repeat(36)}`),
        expQuoRoundUp: new BigDec(`0.${"3".repeat(35)}4`),
        expQuoTruncate: new BigDec(`0.${"3".repeat(36)}`),
        expAdd: new BigDec(4),
        expSub: new BigDec(-2),
      },
      {
        // 2/3 = 0.(6); the 37th digit is a 6, so round goes up with roundUp.
        d1: new BigDec(2),
        d2: new BigDec(3),
        expMul: new BigDec(6),
        expMulTruncate: new BigDec(6),
        expQuo: new BigDec(`0.${"6".repeat(35)}7`),
        expQuoRoundUp: new BigDec(`0.${"6".repeat(35)}7`),
        expQuoTruncate: new BigDec(`0.${"6".repeat(36)}`),
        expAdd: new BigDec(5),
        expSub: new BigDec(-1),
      },
      {
        d1: new BigDec(100),
        d2: new BigDec(100),
        expMul: new BigDec(10000),
        expMulTruncate: new BigDec(10000),
        expQuo: new BigDec(1),
        expQuoRoundUp: new BigDec(1),
        expQuoTruncate: new BigDec(1),
        expAdd: new BigDec(200),
        expSub: new BigDec(0),
      },
      {
        // 0.3333 / 0.0333 = 10.(009); the 37th digit is a 0.
        d1: new BigDec(3333, 4),
        d2: new BigDec(333, 4),
        expMul: new BigDec(1109889, 8),
        expMulTruncate: new BigDec(1109889, 8),
        expQuo: new BigDec(`10.${"009".repeat(12)}`),
        expQuoRoundUp: new BigDec(`10.${"009".repeat(11)}010`),
        expQuoTruncate: new BigDec(`10.${"009".repeat(12)}`),
        expAdd: new BigDec(3666, 4),
        expSub: new BigDec(3, 1),
      },
      {
        // 1e-18 * 1e-18 = 1e-36 is representable at 36 decimals (it would be
        // 0 in an 18-decimal Dec).
        d1: new BigDec("1e-18"),
        d2: new BigDec("1e-18"),
        expMul: new BigDec(1, 36),
        expMulTruncate: new BigDec(1, 36),
        expQuo: new BigDec(1),
        expQuoRoundUp: new BigDec(1),
        expQuoTruncate: new BigDec(1),
        expAdd: new BigDec(2, 18),
        expSub: new BigDec(0),
      },
    ];

    for (const test of tests) {
      const resAdd = test.d1.add(test.d2);
      const resSub = test.d1.sub(test.d2);
      const resMul = test.d1.mul(test.d2);
      const resMulTruncate = test.d1.mulTruncate(test.d2);

      expect(resAdd.toString()).toBe(test.expAdd.toString());
      expect(resSub.toString()).toBe(test.expSub.toString());
      expect(resMul.toString()).toBe(test.expMul.toString());
      expect(resMulTruncate.toString()).toBe(test.expMulTruncate.toString());

      if (test.d2.isZero()) {
        expect(() => {
          test.d1.quo(test.d2);
        }).toThrow();
      } else {
        const resQuo = test.d1.quo(test.d2);
        const resQuoRoundUp = test.d1.quoRoundUp(test.d2);
        const resQuoTruncate = test.d1.quoTruncate(test.d2);

        expect(resQuo.toString()).toBe(test.expQuo.toString());
        expect(resQuoRoundUp.toString()).toBe(test.expQuoRoundUp.toString());
        expect(resQuoTruncate.toString()).toBe(test.expQuoTruncate.toString());
      }
    }
  });

  it("mulRoundUp rounds any non-zero remainder up", () => {
    // 1e-18 * 1e-19 = 1e-37 is below 36-decimal precision.
    const tiny = new BigDec("1e-18").mulRoundUp(new BigDec("1e-19"));
    expect(tiny.toString()).toBe(`0.${"0".repeat(35)}1`);
    expect(new BigDec("1e-18").mulTruncate(new BigDec("1e-19")).isZero()).toBe(
      true
    );
    expect(new BigDec("1e-18").mul(new BigDec("1e-19")).isZero()).toBe(true);

    expect(new BigDec(2).mulRoundUp(new BigDec(3)).toString()).toBe(
      `6.${ZEROS}`
    );
    expect(new BigDec(-2).mulRoundUp(new BigDec(3)).toString()).toBe(
      `-6.${ZEROS}`
    );
  });

  it("should be round up properly", () => {
    const tests: {
      d1: BigDec;
      exp: Int;
    }[] = [
      { d1: new BigDec("0.25"), exp: new Int("1") },
      { d1: new BigDec("0"), exp: new Int("0") },
      { d1: new BigDec("1"), exp: new Int("1") },
      { d1: new BigDec("0.75"), exp: new Int("1") },
      { d1: new BigDec("0.5"), exp: new Int("1") },
      { d1: new BigDec("7.5"), exp: new Int("8") },
      { d1: new BigDec("0.545"), exp: new Int("1") },
      { d1: new BigDec("1.545"), exp: new Int("2") },
      // Negative values truncate toward zero rather than rounding away.
      { d1: new BigDec("-1.545"), exp: new Int("-1") },
      { d1: new BigDec("-0.545"), exp: new Int("0") },
      // A single unit in the 36th place still rounds up.
      { d1: new BigDec(1, 36), exp: new Int("1") },
      { d1: new BigDec(1, 36).neg(), exp: new Int("0") },
    ];

    for (const test of tests) {
      const resPos = test.d1.roundUp();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.roundUpDec();
      expect(resPosDec.toString()).toBe(`${test.exp.toString()}.${ZEROS}`);
    }
  });

  it("should be round properly", () => {
    const tests: {
      d1: BigDec;
      exp: Int;
    }[] = [
      { d1: new BigDec("0.25"), exp: new Int("0") },
      { d1: new BigDec("0"), exp: new Int("0") },
      { d1: new BigDec("1"), exp: new Int("1") },
      { d1: new BigDec("0.75"), exp: new Int("1") },
      // Exact half-way cases.
      { d1: new BigDec("0.5"), exp: new Int("0") },
      { d1: new BigDec("7.5"), exp: new Int("8") },
      { d1: new BigDec("0.545"), exp: new Int("1") },
      { d1: new BigDec("1.545"), exp: new Int("2") },
      // Just below and just above half at the 36th decimal place.
      { d1: new BigDec(`0.4${"9".repeat(35)}`), exp: new Int("0") },
      { d1: new BigDec(`0.5${"0".repeat(34)}1`), exp: new Int("1") },
      { d1: new BigDec(1, 36), exp: new Int("0") },
    ];

    for (const test of tests) {
      const resNeg = test.d1.neg().round();
      expect(resNeg.toString()).toBe(test.exp.neg().toString());

      const resNegDec = test.d1.neg().roundDec();
      expect(resNegDec.toString()).toBe(
        `${test.exp.neg().toString()}.${ZEROS}`
      );

      const resPos = test.d1.round();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.roundDec();
      expect(resPosDec.toString()).toBe(`${test.exp.toString()}.${ZEROS}`);
    }
  });

  it("should be truncated properly", () => {
    const tests: {
      d1: BigDec;
      exp: Int;
    }[] = [
      { d1: new BigDec("0"), exp: new Int("0") },
      { d1: new BigDec("0.25"), exp: new Int("0") },
      { d1: new BigDec("0.75"), exp: new Int("0") },
      { d1: new BigDec("1"), exp: new Int("1") },
      { d1: new BigDec("7.5"), exp: new Int("7") },
      { d1: new BigDec("7.6"), exp: new Int("7") },
      { d1: new BigDec("8.5"), exp: new Int("8") },
      { d1: new BigDec("100.000000001"), exp: new Int("100") },
      { d1: new BigDec(`100.${"0".repeat(35)}1`), exp: new Int("100") },
      { d1: new BigDec(`0.${"9".repeat(36)}`), exp: new Int("0") },
    ];

    for (const test of tests) {
      const resNeg = test.d1.neg().truncate();
      expect(resNeg.toString()).toBe(test.exp.neg().toString());

      const resNegDec = test.d1.neg().truncateDec();
      expect(resNegDec.toString()).toBe(
        `${test.exp.neg().toString()}.${ZEROS}`
      );

      const resPos = test.d1.truncate();
      expect(resPos.toString()).toBe(test.exp.toString());

      const resPosDec = test.d1.truncateDec();
      expect(resPosDec.toString()).toBe(`${test.exp.toString()}.${ZEROS}`);
    }
  });

  it("keeps 36 decimals when converting from and to Dec", () => {
    const fromDec = new BigDec(new BigDec("1.5").toDec());
    expect(fromDec.toString()).toBe(`1.5${"0".repeat(35)}`);

    // toDec() drops everything past the 18th decimal.
    const sub18 = new BigDec(`0.${"0".repeat(18)}5`);
    expect(sub18.toDec().isZero()).toBe(true);
    expect(sub18.isZero()).toBe(false);
  });
});

describe("BigDec half-to-even rounding", () => {
  it.each([
    ["0.5", "0"],
    ["1.5", "2"],
    ["2.5", "2"],
    ["3.5", "4"],
    ["8.5", "8"],
    ["-2.5", "-2"],
  ])("rounds %s to %s", (input, expected) => {
    expect(new BigDec(input).round().toString()).toBe(expected);
  });

  it("applies the same tie-break at the 36th decimal of mul", () => {
    const half = new BigDec(`0.${"0".repeat(35)}5`);
    expect(new BigDec("0.5").mul(half).toString()).toBe(`0.${"0".repeat(35)}2`);
    expect(new BigDec("1.5").mul(half).toString()).toBe(`0.${"0".repeat(35)}8`);
  });
});
