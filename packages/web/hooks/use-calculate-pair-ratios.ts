import { TokenHistoricalPrice } from "@osmosis-labs/stores/build/queries-external/token-historical-chart/types";
import { useMemo } from "react";

export type AssetChartData =
  | (TokenHistoricalPrice & {
      denom: string;
    })[];

const calculatePairRatios = (
  from?: AssetChartData,
  to?: AssetChartData
): AssetChartData => {
  const ratios: AssetChartData = [];

  if (from && to && from.length === to.length) {
    from.forEach((from, i) => {
      // Calculate ratio for each property
      const closeRatio = from.close / to[i].close;
      const highRatio = from.high / to[i].high;
      const lowRatio = from.low / to[i].low;
      const openRatio = from.open / to[i].open;
      const volumeRatio = from.volume / to[i].volume;

      // Push ratios to the array
      ratios.push({
        denom: `${from.denom}/${to[i].denom}`,
        close: closeRatio,
        high: highRatio,
        low: lowRatio,
        open: openRatio,
        volume: volumeRatio,
        time: (from.time + to[i].time) / 2,
      });
    });
  }
  return ratios;
};

export const useCalculatePairRatios = (
  from?: AssetChartData,
  to?: AssetChartData
) => {
  const ratios = useMemo(() => calculatePairRatios(from, to), [from, to]);

  return ratios;
};
