import {
  AreaData,
  AreaSeriesOptions,
  AreaStyleOptions,
  DeepPartial,
  ISeriesApi,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
  WhitespaceData,
} from "lightweight-charts";

import { ChartController, ChartControllerParams } from "./chart";

export class AreaChartController<
  T = TimeChartOptions,
  K = Time
> extends ChartController<T, K> {
  series: ISeriesApi<
    "Area",
    Time,
    AreaData<Time> | WhitespaceData<Time>,
    AreaSeriesOptions,
    DeepPartial<AreaStyleOptions & SeriesOptionsCommon>
  >[] = [];

  constructor(params: ChartControllerParams<T, K>) {
    super(params);

    if (params.series && params.series.length > 0) {
      for (const s of params.series) {
        const series = this.api.addAreaSeries(s.options);
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
