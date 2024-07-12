import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";

import { compare1CTTransactionParams } from "../one-click-trading-settings";

const mockPricePretty = (amount: number) =>
  new PricePretty(DEFAULT_VS_CURRENCY, new Dec(amount));

describe("compare1CTTransactionParams", () => {
  it("should detect no changes when parameters are identical", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: "13485",
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
      networkFeeLimit: "13485",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      spendLimit: mockPricePretty(6000),
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("spendLimit");
  });

  it("should detect multiple changes including sessionPeriod", () => {
    const prevParams: OneClickTradingTransactionParams = {
      isOneClickEnabled: true,
      spendLimit: mockPricePretty(5000),
      networkFeeLimit: "13485",
      sessionPeriod: { end: "1hour" },
    };

    const nextParams: OneClickTradingTransactionParams = {
      ...prevParams,
      spendLimit: mockPricePretty(7000),
      sessionPeriod: { end: "3hours" },
    };

    const changes = compare1CTTransactionParams({ prevParams, nextParams });
    expect(changes).toContain("spendLimit");
    expect(changes).toContain("sessionPeriod");
  });
});
