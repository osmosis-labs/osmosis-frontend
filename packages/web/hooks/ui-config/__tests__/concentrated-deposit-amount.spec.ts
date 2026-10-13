import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import { CoinPretty } from "@osmosis-labs/unit";

import {
  calcHighGasFee,
  ConcentratedDepositAmount,
} from "../concentrated-deposit-amount";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };

function setup(balances: Record<string, string> = {}, currency = osmo) {
  const state = { balances };
  const input = new ConcentratedDepositAmount(
    currency,
    (denom) => state.balances[denom]
  );
  return { input, state };
}

describe("calcHighGasFee", () => {
  it("returns undefined without a fee currency", () => {
    expect(calcHighGasFee(undefined, 3_000_000)).toBeUndefined();
  });

  it("uses the high gas price step", () => {
    const fee = calcHighGasFee(
      { ...osmo, gasPriceStep: { low: 0.01, average: 0.025, high: 0.05 } },
      3_000_000
    );
    expect(fee?.toCoin()).toEqual({ denom: "uosmo", amount: "150000" });
  });

  it("falls back to the default gas price step (0.04)", () => {
    const fee = calcHighGasFee(osmo, 3_000_000);
    expect(fee?.toCoin()).toEqual({ denom: "uosmo", amount: "120000" });
  });
});

describe("ConcentratedDepositAmount", () => {
  it("starts at zero and reports a zero amount error", () => {
    const { input } = setup({ uosmo: "5000000" });
    expect(input.amount).toBe("0");
    expect(input.error).toBeInstanceOf(ZeroAmountError);
    expect(input.getAmountPrimitive()).toEqual({
      denom: "uosmo",
      amount: "0",
    });
  });

  it("reads a zero balance while balances are not loaded", () => {
    const { input } = setup();
    expect(input.balance.toDec().isZero()).toBe(true);
    input.setAmount("1");
    expect(input.error).toBeInstanceOf(InsufficientAmountError);
  });

  it("prefixes a leading dot and converts to base units", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setAmount(".5");
    expect(input.amount).toBe("0.5");
    expect(input.getAmountPrimitive().amount).toBe("500000");
    expect(input.error).toBeUndefined();
  });

  it("validates input", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setAmount("");
    expect(input.error).toBeInstanceOf(EmptyAmountError);
    expect(input.getAmountPrimitive().amount).toBe("0");
    input.setAmount("abc");
    expect(input.error).toBeInstanceOf(InvalidNumberAmountError);
    input.setAmount("-1");
    expect(input.error).toBeInstanceOf(NegativeAmountError);
    input.setAmount("5.000001");
    expect(input.error).toBeInstanceOf(InsufficientAmountError);
    input.setAmount("5");
    expect(input.error).toBeUndefined();
  });

  it("max uses the full balance when no fee applies", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setIsMax(true);
    expect(input.isMax).toBe(true);
    expect(input.amount).toBe("5");
    expect(input.getAmountPrimitive().amount).toBe("5000000");
  });

  it("max subtracts the fee when in the fee currency", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setFee(new CoinPretty(osmo, 120000));
    input.setIsMax(true);
    expect(input.amount).toBe("4.88");
  });

  it("max ignores a fee in a different currency", () => {
    const { input } = setup({ uatom: "5000000" }, atom);
    input.setFee(new CoinPretty(osmo, 120000));
    input.setIsMax(true);
    expect(input.amount).toBe("5");
  });

  it("max is zero when the balance does not cover the fee", () => {
    const { input } = setup({ uosmo: "100000" });
    input.setFee(new CoinPretty(osmo, 120000));
    input.setIsMax(true);
    expect(input.amount).toBe("0");
  });

  it("applies fractions to the fee-adjusted balance", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setFee(new CoinPretty(osmo, 1000000));
    input.setFraction(0.5);
    expect(input.amount).toBe("2");
    expect(input.isMax).toBe(false);
  });

  it("typing clears a fraction", () => {
    const { input } = setup({ uosmo: "5000000" });
    input.setIsMax(true);
    input.setAmount("1");
    expect(input.fraction).toBeUndefined();
    expect(input.amount).toBe("1");
  });

  it("follows the balance and send currency", () => {
    const { input, state } = setup({ uosmo: "1000000" });
    input.setIsMax(true);
    expect(input.amount).toBe("1");
    state.balances = { uosmo: "2000000", uatom: "3000000" };
    // plain (non-observable) test balances: re-read after changing currency
    input.setSendCurrency(atom);
    expect(input.sendCurrency).toBe(atom);
    expect(input.amount).toBe("3");
  });
});
