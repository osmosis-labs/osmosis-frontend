import { Dec, Int } from "@keplr-wallet/unit";

export function calcPriceImpactTokenIn(
  spotPriceBefore: Dec,
  tokenIn: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenIn).quo(effectivePrice).truncate();
}

export function calcPriceImpactTokenOut(
  spotPriceBefore: Dec,
  tokenOut: Int,
  priceImpact: Dec
): Int {
  const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
  return new Dec(tokenOut).mul(effectivePrice).truncate();
}
