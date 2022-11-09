import type { PointOptionsObject, SeriesPieOptions } from "highcharts";
import { AppCurrency } from "@keplr-wallet/types";
import { HIGHCHART_GRADIENTS } from "./gradients";

export const generateSeries = (
  data: { currency: AppCurrency; percentage: string; amount: string }[]
): SeriesPieOptions[] => {
  const series = {
    type: "pie",
    allowPointSelect: true,
    cursor: "pointer",
    dataLabels: {
      enabled: false,
    },
    innerSize: "70%",
    name: "Pool",
    data: [] as PointOptionsObject[],
  };
  data.forEach((d, i) => {
    series.data.push({
      name: d.currency.coinDenom.toUpperCase(),
      y: Number(d.percentage),
      x: Number(d.amount),
      color: HIGHCHART_GRADIENTS?.[i] ? HIGHCHART_GRADIENTS?.[i] : undefined,
    });
  });
  return [series as SeriesPieOptions];
};
