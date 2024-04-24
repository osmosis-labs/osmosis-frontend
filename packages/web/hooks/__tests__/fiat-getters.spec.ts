import { Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { Asset, DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";

import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
} from "../fiat-getters";

const testDenom = "USDC";

describe("getTokenInFeeAmountFiatValue", () => {
  const defaultZeroDecimalAsset: Asset = {
    coinName: "test",
    coinDenom: testDenom,
    coinMinimalDenom: testDenom,
    coinDecimals: 0,
    coinGeckoId: "",
    isVerified: true,
    isUnstable: false,
  };
  const defaultTokenIn = new Int(100);
  const defaultPriceOne = new PricePretty(DEFAULT_VS_CURRENCY, 1);

  const expectedZeroPricePretty = new PricePretty(DEFAULT_VS_CURRENCY, 0);

  describe("undefined inputs", () => {
    it("should return PricePretty with 0 value if asset is undefined", () => {
      const asset: Asset | undefined = undefined;
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = defaultPriceOne;

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });

    it("should return PricePretty with 0 value if tokenInFeeAmount is undefined", () => {
      const asset: Asset | undefined = defaultZeroDecimalAsset;
      const tokenInFeeAmount: Int | undefined = undefined;
      const inAmountInputPrice: PricePretty | undefined = defaultPriceOne;

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });

    it("should return PricePretty with 0 value if inAmountInputPrice is zero", () => {
      const asset: Asset | undefined = defaultZeroDecimalAsset;
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = undefined;

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });
  });

  describe("valid inputs", () => {
    it("should calculate tokenInFiatFeeAmount correctly, exponent zero, fee amount 100, price 1", () => {
      const asset: Asset | undefined = defaultZeroDecimalAsset;
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = defaultPriceOne;

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result.toDec()).toEqual(new Dec(100));
    });

    it("should calculate tokenInFiatFeeAmount correctly, exponent zero, fee amount 100, price 2", () => {
      const asset: Asset | undefined = defaultZeroDecimalAsset;
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = new PricePretty(
        DEFAULT_VS_CURRENCY,
        2
      );

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result.toDec()).toEqual(new Dec(200));
    });

    it("should calculate tokenInFiatFeeAmount correctly, exponent 18, fee amount 100, price 1", () => {
      const asset: Asset | undefined = {
        coinName: "test",
        coinDenom: testDenom,
        coinMinimalDenom: testDenom,
        coinDecimals: 18,
        coinGeckoId: "",
        isVerified: true,
        isUnstable: false,
      };
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = defaultPriceOne;

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result.toDec()).toEqual(new Dec(0.0000000000000001));
    });

    it("should calculate tokenInFiatFeeAmount correctly, exponent 18, fee amount 100, price 2", () => {
      const asset: Asset | undefined = {
        coinName: "test",
        coinDenom: testDenom,
        coinMinimalDenom: testDenom,
        coinDecimals: 18,
        coinGeckoId: "",
        isVerified: true,
        isUnstable: false,
      };
      const tokenInFeeAmount: Int | undefined = defaultTokenIn;
      const inAmountInputPrice: PricePretty | undefined = new PricePretty(
        DEFAULT_VS_CURRENCY,
        2
      );

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result.toDec()).toEqual(new Dec(0.0000000000000002));
    });

    it("should calculate tokenInFiatFeeAmount correctly (zero return due to truncation), exponent 18, fee amount 1, price 0.5", () => {
      const asset: Asset | undefined = {
        coinName: "test",
        coinDenom: testDenom,
        coinMinimalDenom: testDenom,
        coinDecimals: 18,
        coinGeckoId: "",
        isVerified: true,
        isUnstable: false,
      };
      const tokenInFeeAmount: Int | undefined = new Int(1);
      const inAmountInputPrice: PricePretty | undefined = new PricePretty(
        DEFAULT_VS_CURRENCY,
        0.5
      );

      const result = getTokenInFeeAmountFiatValue(
        asset,
        tokenInFeeAmount,
        inAmountInputPrice
      );

      expect(result.toDec()).toEqual(new Dec(0));
    });
  });
});

describe("getTokenOutFiatValue", () => {
  const defaultPriceImpactTokenOut = new Dec(0.5);
  const defaultInAmountFiatValue = new Dec(100);
  const expectedZeroPricePretty = new PricePretty(DEFAULT_VS_CURRENCY, 0);

  describe("invalid inputs", () => {
    it("should return PricePretty with 0 value if priceImpactTokenOut is undefined", () => {
      const priceImpactTokenOut: Dec | undefined = undefined;
      const inAmountFiatValue: Dec | undefined = defaultInAmountFiatValue;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });

    it("should return PricePretty with 0 value if inAmountFiatValue is undefined", () => {
      const priceImpactTokenOut: Dec | undefined = defaultPriceImpactTokenOut;
      const inAmountFiatValue: Dec | undefined = undefined;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });

    it("should return PricePretty with 0 value if priceImpactTokenOut is greater than or equal to 1", () => {
      const priceImpactTokenOut: Dec | undefined = new Dec(1);
      const inAmountFiatValue: Dec | undefined = defaultInAmountFiatValue;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });

    it("should return PricePretty with 0 value if priceImpactTokenOut is less than 0", () => {
      const priceImpactTokenOut: Dec | undefined = new Dec(-0.5);
      const inAmountFiatValue: Dec | undefined = defaultInAmountFiatValue;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result).toEqual(expectedZeroPricePretty);
    });
  });

  describe("valid inputs", () => {
    it("should calculate tokenOutFiatValue correctly, price impact 0.5, fiat value 100", () => {
      const priceImpactTokenOut: Dec | undefined = defaultPriceImpactTokenOut;
      const inAmountFiatValue: Dec | undefined = defaultInAmountFiatValue;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result.toDec()).toEqual(new Dec(50));
    });

    it("should calculate tokenOutFiatValue correctly, price impact 0.2, fiat value 100", () => {
      const priceImpactTokenOut: Dec | undefined = new Dec(0.2);
      const inAmountFiatValue: Dec | undefined = defaultInAmountFiatValue;

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result.toDec()).toEqual(new Dec(80));
    });

    it("should calculate tokenOutFiatValue correctly, price impact 0.8, fiat value 50", () => {
      const priceImpactTokenOut: Dec | undefined = new Dec(0.8);
      const inAmountFiatValue: Dec | undefined = new Dec(50);

      const result = getTokenOutFiatValue(
        priceImpactTokenOut,
        inAmountFiatValue
      );

      expect(result.toDec()).toEqual(new Dec(10));
    });
  });
});
