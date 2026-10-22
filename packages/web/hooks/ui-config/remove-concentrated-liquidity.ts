import { CoinPretty, Dec, DecUtils } from "@osmosis-labs/unit";
import { EmptyAmountError } from "@osmosis-labs/utils";

export type RemoveConcentratedLiquidityPosition = {
  liquidity: Dec;
  baseAsset: CoinPretty;
  quoteAsset: CoinPretty;
};

/** The user-selected percentage (0 to 1) of the position's liquidity. */
export function getEffectiveLiquidity(
  position: Pick<RemoveConcentratedLiquidityPosition, "liquidity">,
  percentage: number
): Dec | undefined {
  return position.liquidity?.mul(new Dec(percentage));
}

/** The amount of each token in the position given the user-selected percentage to remove. */
export function getEffectiveLiquidityAmounts(
  position: RemoveConcentratedLiquidityPosition,
  percentage: number
): { base: CoinPretty; quote: CoinPretty } | undefined {
  const liquidity = getEffectiveLiquidity(position, percentage);
  const base = position.baseAsset;
  const quote = position.quoteAsset;

  if (!liquidity || !base || !quote) return;

  const scale = (asset: CoinPretty) =>
    new CoinPretty(
      asset.currency,
      asset
        .toDec()
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(asset.currency.coinDecimals)
        )
        .mul(new Dec(percentage))
    );

  return { base: scale(base), quote: scale(quote) };
}

export function getRemoveConcentratedLiquidityError(
  percentage: number
): Error | undefined {
  if (!percentage) return new EmptyAmountError("percentage is zero");
  return;
}
