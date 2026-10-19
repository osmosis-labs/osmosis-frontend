import {
  BigDec,
  maxSpotPrice,
  minSpotPrice,
  priceToTick,
} from "@osmosis-labs/math";
import type {
  ActiveLiquidityPerTickRange,
  ConcentratedPoolRawResponse,
  Pool,
} from "@osmosis-labs/server";
import { Dec, DecUtils, Int } from "@osmosis-labs/unit";

/** Pool with no initial liquidity (zero or missing sqrt price). */
export function isEmptyConcentratedPool(pool: Pool | undefined): boolean {
  if (pool?.type !== "concentrated") return false;

  const currentSqrtPrice = (pool.raw as ConcentratedPoolRawResponse)
    ?.current_sqrt_price;
  if (!currentSqrtPrice) return true;

  try {
    return new BigDec(currentSqrtPrice).isZero();
  } catch {
    // If the value cannot be parsed as a BigDec, fall back to treating it as non-empty
    return false;
  }
}

/** Factor converting a raw quote/base price into a display price. */
export function getQuoteOverBaseMultiplier(
  baseDecimals: number | undefined,
  quoteDecimals: number | undefined
): Dec {
  return DecUtils.getTenExponentN((baseDecimals ?? 0) - (quoteDecimals ?? 0));
}

export function getCurrentPrice(
  pool: Pool | null | undefined,
  quoteOverBase: Dec
): Dec {
  if (!pool || pool.type !== "concentrated") return new Dec(0);
  const currentSqrtPrice = (pool.raw as ConcentratedPoolRawResponse)
    ?.current_sqrt_price;
  if (!currentSqrtPrice) return new Dec(0);

  const sqrtPrice = new BigDec(currentSqrtPrice);

  return sqrtPrice.mul(sqrtPrice).toDec().mul(quoteOverBase);
}

/** Number of decimals to show for a price. */
export function getPriceDecimal(lastClose: number | undefined): number {
  if (lastClose === undefined) return 2;
  if (lastClose <= 0.001) return 5;
  if (lastClose <= 0.01) return 4;
  if (lastClose <= 0.1) return 3;
  if (lastClose < 1) return 3;
  return 2;
}

/**
 * Price (y) domain of the chart: the historical prices (or +-20% around the
 * current price when there is no history) joined with the selected range,
 * padded by 10% and widened by the zoom factor.
 */
export function computeYRange({
  prices,
  currentPrice,
  range,
  zoom,
}: {
  prices: number[];
  currentPrice: Dec;
  range: [Dec, Dec] | null;
  zoom: number;
}): [number, number] {
  const padding = 0.1;
  const hasData = prices.length > 0;

  const chartMin = hasData
    ? Math.max(0, Math.min(...prices))
    : Number(currentPrice?.mul(new Dec(0.8)).toString() ?? 0);
  const chartMax = hasData
    ? Math.max(...prices)
    : Number(currentPrice?.mul(new Dec(1.2)).toString() ?? 0);

  const absMax = range
    ? Math.max(Number(range[1].toString()), chartMax)
    : chartMax;
  const absMin = range
    ? Math.min(Number(range[0].toString()), chartMin)
    : chartMin;

  const delta = Math.abs(absMax - absMin);

  const minWithPadding = Math.max(0, absMin - delta * padding);
  const maxWithPadding = absMax + delta * padding;

  const zoomAdjustedMin = zoom > 1 ? absMin / zoom : absMin * zoom;
  const zoomAdjustedMax = absMax * zoom;

  let finalMin = minWithPadding;
  let finalMax = maxWithPadding;

  if (zoomAdjustedMin < minWithPadding) finalMin = zoomAdjustedMin;
  if (zoomAdjustedMax > maxWithPadding) finalMax = zoomAdjustedMax;

  return [finalMin, finalMax];
}

export function getLiqFrom(
  target: Int,
  list: ActiveLiquidityPerTickRange[]
): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i].lowerTick.lte(target) && list[i].upperTick.gte(target)) {
      return Number(list[i].liquidityAmount.toString());
    }
  }
  return 0;
}

/** Liquidity depth sampled at 21 evenly spaced prices across `yRange`. */
export function computeDepthChartData({
  activeLiquidity,
  yRange: [min, max],
  quoteOverBase,
}: {
  activeLiquidity: ActiveLiquidityPerTickRange[];
  yRange: [number, number];
  quoteOverBase: Dec;
}): { price: number; depth: number }[] {
  if (min === max) return [];

  const depths: { price: number; depth: number }[] = [];

  for (let price = min; price <= max; price += (max - min) / 20) {
    if (quoteOverBase.isZero()) continue;

    const spotPriceToConvert = new Dec(price).quo(quoteOverBase);

    depths.push({
      price,
      depth: getLiqFrom(
        priceToTick(
          spotPriceToConvert.gt(maxSpotPrice)
            ? maxSpotPrice
            : spotPriceToConvert.lt(minSpotPrice)
              ? minSpotPrice
              : spotPriceToConvert
        ),
        activeLiquidity
      ),
    });
  }

  return depths;
}

export function computeXRange(
  depthChartData: { price: number; depth: number }[]
): [number, number] {
  if (!depthChartData.length) return [0, 0];

  return [0, Math.max(...depthChartData.map((d) => d.depth)) * 1.2];
}
