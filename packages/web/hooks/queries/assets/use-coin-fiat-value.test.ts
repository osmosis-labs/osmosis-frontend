import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";

import { mulPrice } from "./use-coin-fiat-value";

const testDenom = "USDC";

describe("mulPrice", () => {
  const defaultCurrency = {
    coinDenom: testDenom,
    coinMinimalDenom: testDenom,
    coinDecimals: 0,
  };

  const defaultHundredCoin: CoinPretty = new CoinPretty(defaultCurrency, 100);
  const defaultTenPrice = new PricePretty(DEFAULT_VS_CURRENCY, 10);

  it("should return undefined if either amount or price is undefined", () => {
    expect(mulPrice(undefined, undefined, DEFAULT_VS_CURRENCY)).toBeUndefined();
    expect(
      mulPrice(defaultHundredCoin, undefined, DEFAULT_VS_CURRENCY)
    ).toBeUndefined();
    expect(
      mulPrice(undefined, defaultTenPrice, DEFAULT_VS_CURRENCY)
    ).toBeUndefined();
  });

  it("should return the multiplied price if both amount and price are defined", () => {
    const expectedValue = defaultHundredCoin
      .toDec()
      .mul(defaultTenPrice.toDec());
    const expectedPrice = new PricePretty(DEFAULT_VS_CURRENCY, expectedValue);

    expect(
      mulPrice(defaultHundredCoin, defaultTenPrice, DEFAULT_VS_CURRENCY)
    ).toEqual(expectedPrice);
  });
});
