import { Dec, Int } from "@keplr-wallet/unit";

export function calculateMinTokenOutByTokenInWithSlippage(
  beforeSpotPriceInOverOut: Dec,
  tokenInAmount: Int,
  slippage: Dec
): Int {
  const expectedEffectivePriceInOverOut = beforeSpotPriceInOverOut.mulTruncate(
    new Dec(1).add(slippage)
  );

  return new Dec(1)
    .quoTruncate(expectedEffectivePriceInOverOut)
    .mulTruncate(tokenInAmount.toDec())
    .truncate();
}

export function calculateMaxTokenInByTokenOutWithSlippage(
  beforeSpotPriceInOverOut: Dec,
  tokenOutAmount: Int,
  slippage: Dec
): Int {
  const expectedEffectivePriceInOverOut = beforeSpotPriceInOverOut.mulTruncate(
    new Dec(1).add(slippage)
  );

  return expectedEffectivePriceInOverOut
    .mulTruncate(tokenOutAmount.toDec())
    .truncate();
}
