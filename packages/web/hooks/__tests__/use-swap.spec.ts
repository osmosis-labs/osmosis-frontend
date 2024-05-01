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

  it("returns undefined when token out is undefined. Otherwise, return token out without subtracting fee", () => {
    const tokenOut = new CoinPretty(osmoMockCurrency, new Dec(100));
    const tokenInFeeAmount = new Int(10);
    expect(
      getTokenOutMinusSwapFee({
        tokenOut: undefined,
        tokenInAsset: atomMockCurrency,
        tokenInFeeAmount,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBeUndefined();
    expect(
      getTokenOutMinusSwapFee({
        tokenOut,
        tokenInAsset: atomMockCurrency,
        tokenInFeeAmount,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBe(tokenOut);
    expect(
      getTokenOutMinusSwapFee({
        tokenOut,
        tokenInAsset: atomMockCurrency,
        tokenInFeeAmount: undefined,
        quoteBaseOutSpotPrice: undefined,
      })
    ).toBe(tokenOut);
  });

  it("calculates the token out amount minus the swap fee correctly", () => {
    const tokenIn = new CoinPretty(
      atomMockCurrency,
      new Dec(10000).mul(
        DecUtils.getTenExponentN(atomMockCurrency.coinDecimals)
      )
    );

    // We get 87,951.48 OSMO before the fee
    const tokenOut = new CoinPretty(
      osmoMockCurrency,
      new Dec(87951.48).mul(
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
      tokenInAsset: tokenIn.currency,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice,
    });

    /**
     * Using the formula
     * Token Out Minus Swap Fee = Token Out − (Token In Fee Amount × Quote Base Out Spot Price)
     *
     * Token In = 10000 ATOM
     * Swap Fee = 0.0023 or 0.23%
     * Token Out = 87951.48 OSMO
     * Token In Fee Amount = 23 ATOM
     * Quote Base Out Spot Price = 8.795148 OSMO/ATOM
     *
     * Token Out Minus Swap Fee = 87951.48 - (23/10^6) * 8.795148 * 10^6
     * Token Out Minus Swap Fee = 87951.48 - 202.288404
     * Token Out Minus Swap Fee = 87749.1915960000000000 OSMO
     */
    expect(result?.toDec().toString()).toBe("87749.191596000000000000");
  });

  it("calculates the token out amount minus the swap fee correctly for a currency with different decimals", () => {
    const tokenIn = new CoinPretty(
      osmoMockCurrency,
      new Dec(100).mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
    );

    // We get 75 RANDOM before the fee
    const tokenOut = new CoinPretty(
      randomDecimalsMockCurrency,
      new Dec(75).mul(
        DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals)
      )
    );

    // 5 OSMO fee = 3.75 RANDOM
    const tokenInFeeAmount = new Dec(5)
      .mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
      .truncate();

    // 1 OSMO = 0.75 RANDOM
    const quoteBaseOutSpotPrice = new CoinPretty(
      randomDecimalsMockCurrency,
      new Dec(0.75).mul(
        DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals)
      )
    );

    const result = getTokenOutMinusSwapFee({
      tokenOut,
      tokenInAsset: tokenIn.currency,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice,
    });

    /**
     * Using the formula
     * Token Out Minus Swap Fee = Token Out − (Token In Fee Amount × Quote Base Out Spot Price)
     *
     * Token In = 100 OSMO
     * Token Out = 75 RANDOM
     * Token In Fee Amount = 5 OSMO
     * Quote Base Out Spot Price = 0.75 OSMO/RANDOM
     *
     * Token Out Minus Swap Fee =  75 - (5/10^6) * 0.75 * 10^12
     * Token Out Minus Swap Fee = 75 - 3.75
     * Token Out Minus Swap Fee = 71.25 RANDOM
     */
    expect(result?.toDec().toString()).toBe("71.250000000000000000");
  });

  it("returns amount without fee subtraction if the swap fee is greater than the output token amount", () => {
    const tokenIn = new CoinPretty(
      osmoMockCurrency,
      new Dec(100).mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
    );

    // We get 75 RANDOM before the fee
    const tokenOut = new CoinPretty(
      randomDecimalsMockCurrency,
      new Dec(75).mul(
        DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals)
      )
    );

    // 110 OSMO fee = 82.5 RANDOM
    const tokenInFeeAmount = new Dec(110)
      .mul(DecUtils.getTenExponentN(osmoMockCurrency.coinDecimals))
      .truncate();

    // 1 OSMO = 0.75 RANDOM
    const quoteBaseOutSpotPrice = new CoinPretty(
      randomDecimalsMockCurrency,
      new Dec(0.75).mul(
        DecUtils.getTenExponentN(randomDecimalsMockCurrency.coinDecimals)
      )
    );

    const result = getTokenOutMinusSwapFee({
      tokenOut,
      tokenInAsset: tokenIn.currency,
      tokenInFeeAmount,
      quoteBaseOutSpotPrice,
    });
    expect(result).toBe(tokenOut);
  });
});
