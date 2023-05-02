import { Dec, Int } from "@keplr-wallet/unit";

/** Use the before spot price, in amount, and slippage setting to get the min out amount received. */
export function calcPriceImpactWithAmount(
  spotPriceBefore: Dec,
  tokenAmount: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenAmount).quo(effectivePrice).truncate();
}
