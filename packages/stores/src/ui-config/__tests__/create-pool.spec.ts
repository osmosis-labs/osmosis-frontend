import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { AppCurrency } from "@osmosis-labs/unit";

import { ObservableCreatePoolConfig } from "../create-pool";
import { DepositNoBalanceError } from "../errors";

const osmo: AppCurrency = {
  coinDenom: "OSMO",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
};
const atom: AppCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
};
const gamm: AppCurrency = {
  coinDenom: "GAMM/POOL/1",
  coinMinimalDenom: "gamm/pool/1",
  coinDecimals: 18,
};

function makeConfig() {
  const config = new ObservableCreatePoolConfig(
    {} as unknown as ChainGetter,
    "osmosis-1",
    "osmo1sender"
  );
  config.setPoolType("weighted");
  return config;
}

describe("ObservableCreatePoolConfig balances", () => {
  it("has no sendable currencies until balances are set", () => {
    const config = makeConfig();
    expect(config.sendableCurrencies).toEqual([]);
    expect(config.positiveBalanceError).toBeInstanceOf(DepositNoBalanceError);

    config.setBalances([{ currency: osmo, amount: "1000000" }]);
    expect(config.sendableCurrencies).toEqual([osmo]);
    expect(config.positiveBalanceError).toBeUndefined();
  });

  it("excludes zero balances and gamm shares from sendable currencies", () => {
    const config = makeConfig();
    config.setBalances([
      { currency: osmo, amount: "1000000" },
      { currency: atom, amount: "0" },
      { currency: gamm, amount: "5" },
    ]);
    expect(config.sendableCurrencies).toEqual([osmo]);
  });

  it("excludes already added assets from remaining currencies", () => {
    const config = makeConfig();
    config.setBalances([
      { currency: osmo, amount: "1000000" },
      { currency: atom, amount: "2000000" },
    ]);
    config.addAsset(osmo);
    expect(config.assets).toHaveLength(1);
    expect(config.remainingSelectableCurrencies).toEqual([atom]);
  });

  it("reads asset balances from the latest balances", () => {
    const config = makeConfig();
    config.setBalances([{ currency: osmo, amount: "1500000" }]);
    config.addAsset(osmo);
    const { amountConfig } = config.assets[0];
    expect(amountConfig.balance.toDec().toString()).toBe(
      "1.500000000000000000"
    );

    config.setBalances([{ currency: osmo, amount: "2000000" }]);
    expect(amountConfig.balance.toDec().toString()).toBe(
      "2.000000000000000000"
    );

    config.setBalances([]);
    expect(amountConfig.balance.toDec().isZero()).toBe(true);
  });
});

describe("CreatePoolAssetAmount", () => {
  function makeAmount(balance = "1500000") {
    const config = makeConfig();
    config.setBalances([{ currency: osmo, amount: balance }]);
    config.addAsset(osmo);
    return { config, amount: config.assets[0].amountConfig };
  }

  it("reports empty, invalid, zero and negative amounts", () => {
    const { amount } = makeAmount();
    expect(amount.error).toBeInstanceOf(EmptyAmountError);

    amount.setAmount("abc");
    expect(amount.error).toBeInstanceOf(InvalidNumberAmountError);

    amount.setAmount("0");
    expect(amount.error).toBeInstanceOf(ZeroAmountError);

    amount.setAmount("-1");
    expect(amount.error).toBeInstanceOf(NegativeAmountError);
  });

  it("reports insufficient balance and accepts amounts within balance", () => {
    const { amount } = makeAmount();
    amount.setAmount("1.500001");
    expect(amount.error).toBeInstanceOf(InsufficientAmountError);

    amount.setAmount("1.5");
    expect(amount.error).toBeUndefined();
  });

  it("prefixes a leading dot with zero", () => {
    const { amount } = makeAmount();
    amount.setAmount(".5");
    expect(amount.amount).toBe("0.5");
  });

  it("uses the full balance when max is set and clears it on manual input", () => {
    const { amount } = makeAmount();
    amount.setIsMax(true);
    expect(amount.isMax).toBe(true);
    expect(amount.amount).toBe("1.5");
    expect(amount.error).toBeUndefined();

    amount.setAmount("1");
    expect(amount.isMax).toBe(false);
    expect(amount.amount).toBe("1");
  });

  it("supports fractions of the balance and zero for an empty balance", () => {
    const { config, amount } = makeAmount();
    amount.setFraction(0.5);
    expect(amount.amount).toBe("0.75");

    amount.setIsMax(true);
    config.setBalances([]);
    expect(amount.amount).toBe("0");
  });

  it("tracks the selected currency balance", () => {
    const config = makeConfig();
    config.setBalances([
      { currency: osmo, amount: "1000000" },
      { currency: atom, amount: "3000000" },
    ]);
    config.addAsset(osmo);
    const { amountConfig } = config.assets[0];
    amountConfig.setSendCurrency(atom);
    amountConfig.setIsMax(true);
    expect(amountConfig.amount).toBe("3");
  });
});
