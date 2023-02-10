import { Dec } from "@keplr-wallet/unit";
import assert from "assert";

import { pow } from "../../utils";
import { WeightedPoolMath } from "../weighted";

const powPrecision = new Dec("0.00000001");

describe("Test osmosis math", () => {
  test("Test pow", () => {
    const s = pow(new Dec("1.68"), new Dec("0.32"));
    const expected = new Dec("1.18058965");
    assert.strictEqual(
      expected.sub(s).abs().lte(powPrecision),
      true,
      "expected value & actual value's difference should less than precision"
    );
  });

  test("Test calcSpotPrice", () => {
    const actual = WeightedPoolMath.calcSpotPrice(
      new Dec("100"),
      new Dec("0.1"),
      new Dec("200"),
      new Dec("0.3"),
      new Dec("0")
    );
    const expected = new Dec("1.5");
    assert.strictEqual(
      expected.sub(actual).abs().lte(powPrecision),
      true,
      "expected value & actual value's difference should less than precision"
    );
  });

  test("Test calcSpotPriceWithSwapFee", () => {
    const actual = WeightedPoolMath.calcSpotPrice(
      new Dec("100"),
      new Dec("0.1"),
      new Dec("200"),
      new Dec("0.3"),
      new Dec("0.01")
    );
    const expected = new Dec("1.51515151");
    assert.strictEqual(
      expected.sub(actual).abs().lte(powPrecision),
      true,
      "expected value & actual value's difference should less than precision"
    );
  });

  test("Test calcOutGivenIn", () => {
    const actual = WeightedPoolMath.calcOutGivenIn(
      new Dec("100"),
      new Dec("0.1"),
      new Dec("200"),
      new Dec("0.3"),
      new Dec("40"),
      new Dec("0.01")
    );
    const expected = new Dec("21.0487006");
    assert.strictEqual(
      expected
        .sub(actual)
        .abs()
        .lte(powPrecision.mul(new Dec("10000"))),
      true,
      "expected value & actual value's difference should less than precision*10000"
    );
  });

  test("Test calcInGivenOut", () => {
    const actual = WeightedPoolMath.calcInGivenOut(
      new Dec("100"),
      new Dec("0.1"),
      new Dec("200"),
      new Dec("0.3"),
      new Dec("70"),
      new Dec("0.01")
    );
    const expected = new Dec("266.8009177");
    assert.strictEqual(
      expected
        .sub(actual)
        .abs()
        .lte(powPrecision.mul(new Dec("10"))),
      true,
      "expected value & actual value's difference should less than precision*10"
    );
  });

  test("Test calcPoolOutGivenSingleIn", () => {
    const actual = WeightedPoolMath.calcPoolOutGivenSingleIn(
      new Dec("100"),
      new Dec("0.2"),
      new Dec("300"),
      new Dec("1"),
      new Dec("40"),
      new Dec("0.15")
    );
    const expected = new Dec("18.6519592");
    assert.strictEqual(
      expected
        .sub(actual)
        .abs()
        .lte(powPrecision.mul(new Dec("10000"))),
      true,
      "expected value & actual value's difference should less than precision*10000"
    );
  });
});
