import { Dec, RatePretty } from "@osmosis-labs/unit";

export function getShouldHideSlippage(
  priceImpact: RatePretty = new RatePretty(new Dec(0))
) {
  return priceImpact.toDec().abs().mul(new Dec(100)).lt(new Dec(0.5));
}
