import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";

import { compare1CTTransactionParams } from "../one-click-trading-settings";

const mockCoinPretty = (amount: number) =>
  new CoinPretty(
    {
      coinDenom: "OSMO",
      coinDecimals: 6,
      coinMinimalDenom: "uosmo",
    },
    new Dec(amount)
  );

const mockPricePretty = (amount: number) =>
  new PricePretty(DEFAULT_VS_CURRENCY, new Dec(amount));

describe("compare1CTTransactionParams", () => {
  it("should detect no changes when parameters are identical", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: mockCoinPretty(13485),
      resetPeriod: "day",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams = { ...prevParams };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toEqual([]);
  });

  it("should detect changes in spendLimit", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: mockCoinPretty(13485),
      resetPeriod: "day",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      spendLimit: mockPricePretty(6000),
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("spendLimit");
  });

  it("should detect changes in networkFeeLimit", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: mockCoinPretty(13485),
      resetPeriod: "day",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      networkFeeLimit: mockCoinPretty(15000),
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("networkFeeLimit");
  });

  it("should detect changes in resetPeriod", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: mockCoinPretty(13485),
      resetPeriod: "day",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      resetPeriod: "week",
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("resetPeriod");
  });

  it("should detect multiple changes including sessionPeriod", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: mockCoinPretty(13485),
      resetPeriod: "day",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      spendLimit: mockPricePretty(7000),
      networkFeeLimit: mockCoinPretty(16000),
      resetPeriod: "month",
      sessionPeriod: { end: "3hours" },
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("spendLimit");
    expect(changes).toContain("networkFeeLimit");
    expect(changes).toContain("resetPeriod");
    expect(changes).toContain("sessionPeriod");
  });
});
