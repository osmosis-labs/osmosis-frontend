import { CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";

import {
  determineNextFallbackFromDenom,
  determineNextFallbackToDenom,
  getTokenOutMinusSwapFee,
} from "../use-swap";

describe("determineNextFromDenom", () => {
  const DefaultDenoms = ["ATOM", "OSMO"];

  test("fromAssetDenom === initialFromDenom and toAssetDenom === DefaultDenoms[0]", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("fromAssetDenom === initialFromDenom and toAssetDenom !== DefaultDenoms[0]", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "OSMO",
        toAssetDenom: "OSMO",
        initialFromDenom: "OSMO",
        initialToDenom: "ATOM",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });

  test("fromAssetDenom !== initialFromDenom and initialFromDenom === toAssetDenom", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("fromAssetDenom !== initialFromDenom and initialFromDenom !== toAssetDenom", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "BTC",
        toAssetDenom: "ETH",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });
});

describe("determineNextToDenom", () => {
  const DefaultDenoms = ["ATOM", "OSMO"];

  test("toAssetDenom === initialToDenom and fromAssetDenom !== DefaultDenoms[1]", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("toAssetDenom === initialToDenom and fromAssetDenom === DefaultDenoms[1]", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "OSMO",
        toAssetDenom: "OSMO",
        initialToDenom: "OSMO",
        initialFromDenom: "ATOM",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });

  test("toAssetDenom !== initialToDenom and initialToDenom === fromAssetDenom", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("toAssetDenom !== initialToDenom and initialToDenom !== fromAssetDenom", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ETH",
        toAssetDenom: "BTC",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });
});

describe("getTokenOutMinusSwapFee", () => {
  const osmoMockCurrency: Currency = {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
  };
  const atomMockCurrency: Currency = {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
  };
  const randomDecimalsMockCurrency: Currency = {
    coinDenom: "RANDOM",
    coinMinimalDenom: "urandom",
    coinDecimals: 12,
  };

  it("returns undefined if any input is undefined", () => {
    const tokenOut = new CoinPretty(osmoMockCurrency, new Dec(100));
    const tokenInFeeAmount = new Int(10);
    expect(
      getTokenOutMinusSwapFee({
        tokenOut,
        tokenInFeeAmount,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBeUndefined();
    expect(
      getTokenOutMinusSwapFee({
        tokenOut: undefined,
        tokenInFeeAmount,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBeUndefined();
    expect(
      getTokenOutMinusSwapFee({
        tokenOut,
        tokenInFeeAmount: undefined,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBeUndefined();
  });

  it("calculates the token out amount minus the swap fee correctly", () => {
    // We get 87930.043 OSMO
    const tokenOut = new CoinPretty(
      osmoMockCurrency,
      new Dec(87930.043).mul(
        DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals)
      )
    );

    // 23 ATOM fee = 202.288404 OSMO
    const tokenInFeeAmount = new Dec(23)
      .mul(DecUtils.getTenExponentN(atomMockCurrency.coinDecimals))
      .truncate();

    // 1 ATOM = 8.795148 OSMO
    const quoteBaseOutSpotPrice = new CoinPretty(
      osmoMockCurrency,
      new Dec(8.795148).mul(
        DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals)
      )
    );

    const result = getTokenOutMinusSwapFee({
      tokenOut,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice,
    });

    /**
     *  Using the formula
     *  Token Out Minus Swap Fee = Token Out − (Token In Fee Amount × Quote Base Out Spot Price)
     *
     * Token In = 10000 ATOM
     * Swap Fee = 0.0023 or 0.23%
     * Token Out = 87930.043 OSMO
     * Token In Fee Amount = 23 ATOM
     * Quote Base Out Spot Price = 8.795148 OSMO/ATOM
     *
     * Token Out Minus Swap Fee = 87930.043 - (23 * 8.795148)
     * Token Out Minus Swap Fee = 87930.043 OSMO - 202.288404 OSMO
     * Token Out Minus Swap Fee = 87727.754596 OSMO
     */
    expect(result?.toDec().toString()).toBe("87727.754596000000000000");
  });

  it("calculates the token out amount minus the swap fee correctly for a currency with different decimals", () => {
    // Assume we get 500000.123456789012 RANDOM
    const tokenOut = new CoinPretty(
      randomDecimalsMockCurrency,
      new Dec(500000.123456789012).mul(
        DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals)
      )
    );

    // 15 RANDOM = 11.25 OSMO
    const tokenInFeeAmount = new Dec(15)
      .mul(DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals))
      .truncate();

    // 1 RANDOM = 0.75 OSMO
    const quoteBaseOutSpotPrice = new CoinPretty(
      osmoMockCurrency,
      new Dec(0.75).mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
    );

    const result = getTokenOutMinusSwapFee({
      tokenOut,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice,
    });

    /**
     * Using the formula
     * Token Out Minus Swap Fee = Token Out − (Token In Fee Amount × Quote Base Out Spot Price)
     *
     * Token Out = 500000.123456789012 RANDOM
     * Token In Fee Amount = 15 RANDOM
     * Quote Base Out Spot Price = 0.75 OSMO/RANDOM
     *
     * Token Out Minus Swap Fee = 500000.123456789012 - (15 * 0.75)
     * Token Out Minus Swap Fee = 500000.123456789012 - 11.25
     * Token Out Minus Swap Fee = 499988.873456789012 RANDOM
     */
    expect(result?.toDec().toString()).toBe("499988.873456789000000000");
  });

  it("returns zero if the swap fee is greater than the output token amount", () => {
    const tokenOut = new CoinPretty(osmoMockCurrency, new Dec(100));
    const tokenInFeeAmount = new Dec(60)
      .mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
      .truncate();
    const quoteBaseOutSpotPrice = new Dec(2);

    const result = getTokenOutMinusSwapFee({
      tokenOut,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice: new CoinPretty(
        osmoMockCurrency,
        quoteBaseOutSpotPrice
      ),
    });
    expect(result?.toDec().toString()).toBe("0.000000000000000000"); // 100 - (60 * 2) = -20, but returns 0 since it's negative
  });
});
