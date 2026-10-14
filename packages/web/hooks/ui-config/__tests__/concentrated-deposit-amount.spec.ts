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
  createConcentratedDepositAmount,
  DepositInputState,
  INITIAL_DEPOSIT_INPUT,
  setDepositFraction,
  typeDepositAmount,
} from "../concentrated-deposit-amount";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };

/** Test harness holding the input state, like the reducer does in the hook. */
function setup(
  balances: Record<string, string> = {},
  currency = osmo,
  fee?: CoinPretty
) {
  const harness = {
    state: INITIAL_DEPOSIT_INPUT as DepositInputState,
    balances,
    currency,
    fee,
    get input(): ConcentratedDepositAmount {
      return createConcentratedDepositAmount({
        currency: harness.currency,
        rawBalance: harness.balances[harness.currency.coinMinimalDenom],
        state: harness.state,
        fee: harness.fee,
        setAmount: (amount) => {
          harness.state = typeDepositAmount(harness.state, amount);
        },
        setFraction: (fraction) => {
          harness.state = setDepositFraction(harness.state, fraction);
        },
      });
    },
  };
  return harness;
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
    const h = setup();
    expect(h.input.balance.toDec().isZero()).toBe(true);
    h.input.setAmount("1");
    expect(h.input.error).toBeInstanceOf(InsufficientAmountError);
  });

  it("prefixes a leading dot and converts to base units", () => {
    const h = setup({ uosmo: "5000000" });
    h.input.setAmount(".5");
    expect(h.input.amount).toBe("0.5");
    expect(h.input.getAmountPrimitive().amount).toBe("500000");
    expect(h.input.error).toBeUndefined();
  });

  it("validates input", () => {
    const h = setup({ uosmo: "5000000" });
    h.input.setAmount("");
    expect(h.input.error).toBeInstanceOf(EmptyAmountError);
    expect(h.input.getAmountPrimitive().amount).toBe("0");
    h.input.setAmount("abc");
    expect(h.input.error).toBeInstanceOf(InvalidNumberAmountError);
    h.input.setAmount("-1");
    expect(h.input.error).toBeInstanceOf(NegativeAmountError);
    h.input.setAmount("5.000001");
    expect(h.input.error).toBeInstanceOf(InsufficientAmountError);
    h.input.setAmount("5");
    expect(h.input.error).toBeUndefined();
  });

  it("max uses the full balance when no fee applies", () => {
    const h = setup({ uosmo: "5000000" });
    h.input.setIsMax(true);
    expect(h.input.isMax).toBe(true);
    expect(h.input.amount).toBe("5");
    expect(h.input.getAmountPrimitive().amount).toBe("5000000");
  });

  it("max subtracts the fee when in the fee currency", () => {
    const h = setup({ uosmo: "5000000" }, osmo, new CoinPretty(osmo, 120000));
    h.input.setIsMax(true);
    expect(h.input.amount).toBe("4.88");
  });

  it("max ignores a fee in a different currency", () => {
    const h = setup({ uatom: "5000000" }, atom, new CoinPretty(osmo, 120000));
    h.input.setIsMax(true);
    expect(h.input.amount).toBe("5");
  });

  it("max is zero when the balance does not cover the fee", () => {
    const h = setup({ uosmo: "100000" }, osmo, new CoinPretty(osmo, 120000));
    h.input.setIsMax(true);
    expect(h.input.amount).toBe("0");
  });

  it("applies fractions to the fee-adjusted balance", () => {
    const h = setup({ uosmo: "5000000" }, osmo, new CoinPretty(osmo, 1000000));
    h.input.setFraction(0.5);
    expect(h.input.amount).toBe("2");
    expect(h.input.isMax).toBe(false);
  });

  it("typing clears a fraction", () => {
    const h = setup({ uosmo: "5000000" });
    h.input.setIsMax(true);
    h.input.setAmount("1");
    expect(h.input.fraction).toBeUndefined();
    expect(h.input.amount).toBe("1");
  });

  it("follows the balance and send currency", () => {
    const h = setup({ uosmo: "1000000" });
    h.input.setIsMax(true);
    expect(h.input.amount).toBe("1");
    h.balances = { uosmo: "2000000", uatom: "3000000" };
    h.currency = atom;
    expect(h.input.sendCurrency).toBe(atom);
    expect(h.input.amount).toBe("3");
  });

  it("follows balance updates and clears on undefined (balances reset)", () => {
    const h = setup({ uosmo: "5000000" });
    h.input.setIsMax(true);
    expect(h.input.amount).toBe("5");
    expect(h.input.error).toBeUndefined();

    h.balances = { uosmo: "7000000" };
    expect(h.input.amount).toBe("7");

    h.balances = {};
    expect(h.input.amount).toBe("0");
    expect(h.input.error).toBeInstanceOf(ZeroAmountError);

    h.input.setAmount("1");
    expect(h.input.error).toBeInstanceOf(InsufficientAmountError);
    h.balances = { uosmo: "1000000" };
    expect(h.input.error).toBeUndefined();
  });
});
