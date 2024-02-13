import { useMemo } from "react";

import { HistoricalPriceData } from "~/components/home/hooks";

const calculatePairRatios = (
  from?: HistoricalPriceData[],
  to?: HistoricalPriceData[]
) => {
  const ratios: HistoricalPriceData[] = [];

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
        label: `${from.coinDenom}/${to[i].coinDenom}`,
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
  from?: HistoricalPriceData[],
  to?: HistoricalPriceData[]
) => {
  const ratios = useMemo(() => calculatePairRatios(from, to), [from, to]);

  return ratios;
};
