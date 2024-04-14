import { Dec, DecUtils, Int, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { Currency } from "@osmosis-labs/types";

// getTokenInFeeAmountFiatValue returns the fiat value of the token in fee amount.
// If any of the input values are undefined, it returns a PricePretty with 0 value.
// The client must handle the case where the returned value is 0.
// Returns zero on any truncation
// - asset used to determine the precision exponent
// - tokenInFeeAmount the fee amount in the token in asset (scaled according to the asset's precision)
// - inAmountInputPrice the price of the token in asset in fiat (scaled according to the asset's precision)
export function getTokenInFeeAmountFiatValue(
  asset: Currency | undefined,
  tokenInFeeAmount: Int | undefined,
  inAmountInputPrice: PricePretty | undefined
) {
  if (!asset || !tokenInFeeAmount || !inAmountInputPrice) {
    return new PricePretty(DEFAULT_VS_CURRENCY, 0);
  }

  // Get precision exponent.
  const coinDecimals = asset.coinDecimals;
  const precisionExponent = DecUtils.getTenExponentN(coinDecimals);

  // Prevent division by zero
  if (precisionExponent.isZero()) {
    return new PricePretty(DEFAULT_VS_CURRENCY, 0);
  }

  // Get the token in fee amount in fiat.
  const tokenInFiatFeeAmount: Dec = tokenInFeeAmount
    .toDec()
    .quo(precisionExponent)
    .mul(inAmountInputPrice.toDec());

  // Return the token in fee amount in fiat.
  return new PricePretty(DEFAULT_VS_CURRENCY, tokenInFiatFeeAmount);
}

// getTokenOutFiatValue returns the fiat value of the token out amount.
// If any of the input values are undefined, it returns a PricePretty with 0 value.
// The client must handle the case where the returned value is 0.
//
// priceImpactTokenOut is the price impact of the token out amount.
// The price impact must be less than 1 but grater than or equal to zero, otherwise it returns a PricePretty with 0 value.
// inAmountFiatValue is the fiat value of the token in amount.
//
// Returns the fiat value of the token out amount.
export function getTokenOutFiatValue(
  priceImpactTokenOut: Dec | undefined,
  inAmountFiatValue: Dec | undefined
) {
  // If either of the inputs are undefined, return 0
  // Additionally, return 0 if the price impact is greater than or equal to 1 which is an invalid value
  if (
    !priceImpactTokenOut ||
    !inAmountFiatValue ||
    priceImpactTokenOut.gte(new Dec(1)) ||
    priceImpactTokenOut.lt(new Dec(0))
  ) {
    return new PricePretty(DEFAULT_VS_CURRENCY, 0);
  }

  // Calculate the fiat value of the token out amount.
  const oneMinusPriceImpact = new Dec(1).sub(priceImpactTokenOut);
  const tokenOutFiatValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    inAmountFiatValue.mul(oneMinusPriceImpact)
  );

  return tokenOutFiatValue;
}
