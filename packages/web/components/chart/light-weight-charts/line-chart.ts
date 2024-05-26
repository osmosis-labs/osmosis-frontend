import {
  DeepPartial,
  ISeriesApi,
  LineData,
  LineSeriesOptions,
  LineStyleOptions,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
  WhitespaceData,
} from "lightweight-charts";

import { ChartController, ChartControllerParams } from "./chart";

export class LineChartController<
  T = TimeChartOptions,
  K = Time
> extends ChartController<T, K> {
  series: ISeriesApi<
    "Line",
    Time,
    LineData<Time> | WhitespaceData<Time>,
    LineSeriesOptions,
    DeepPartial<LineStyleOptions & SeriesOptionsCommon>
  >[] = [];

  constructor(params: ChartControllerParams<T, K>) {
    super(params);

    if (params.series && params.series.length > 0) {
      for (const s of params.series) {
        const series = this.api.addLineSeries(s.options);
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
