import {
  CandlestickData,
  CandlestickSeriesOptions,
  CandlestickStyleOptions,
  DeepPartial,
  ISeriesApi,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
  WhitespaceData,
} from "lightweight-charts";

import { ChartController, ChartControllerParams } from "./chart-controller";

export class CandlestickChartController<
  T = TimeChartOptions,
  K = Time
> extends ChartController<T, K> {
  series: ISeriesApi<
    "Candlestick",
    Time,
    CandlestickData<Time> | WhitespaceData<Time>,
    CandlestickSeriesOptions,
    DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon>
  >[] = [];

  constructor(params: ChartControllerParams<T, K>) {
    super(params);

    if (params.series && params.series.length > 0) {
      for (const s of params.series) {
        const series = this.api.addCandlestickSeries(s.options);
        series.setData(s.data);

        this.series.push(series);
      }
    }
  }

  override applyOptions(params: Partial<ChartControllerParams<T, K>>): void {
    super.applyOptions(params);

    if (params.series && params.series.length > 0) {
      for (const [key, s] of params.series.entries()) {
        this.series[key].setData(s.data);
      }
    }
  }
}
