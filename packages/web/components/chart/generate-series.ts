import { AppCurrency } from "@keplr-wallet/types";
import type { PointOptionsObject, SeriesPieOptions } from "highcharts";

import { HIGHCHART_GRADIENTS } from "~/components/chart/gradients";

export const generateSeries = (
  data: {
    currency: AppCurrency;
    percentage: string;
    amount: string;
    color?: string;
  }[]
): SeriesPieOptions[] => {
  const series = {
    type: "pie",
    allowPointSelect: true,
    cursor: "pointer",
    dataLabels: {
      enabled: false,
    },
    innerSize: "80%",
    name: "Pool",
    data: [] as PointOptionsObject[],
  };
  data.forEach((d, i) => {
    series.data.push({
      name: d.currency.coinDenom.toUpperCase(),
      y: Number(d.percentage),
      x: Number(d.amount),
      color:
        d?.color ??
        (HIGHCHART_GRADIENTS?.[i] ? HIGHCHART_GRADIENTS?.[i] : undefined),
      sliced: true,
    });
  });
  return [series as SeriesPieOptions];
};
