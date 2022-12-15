import { Dec, Int } from "@keplr-wallet/unit";

export function calcPriceImpactWithAmount(
  spotPriceBefore: Dec,
  tokenAmount: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenAmount).quo(effectivePrice).truncate();
}
