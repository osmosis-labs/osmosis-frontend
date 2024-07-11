import {
  CustomStyleOptions,
  DeepPartial,
  ISeriesApi,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
  UTCTimestamp,
  WhitespaceData,
} from "lightweight-charts";

import { HistogramData } from "~/components/chart/light-weight-charts/plugins/histogram-series/data";
import { HistogramSeries } from "~/components/chart/light-weight-charts/plugins/histogram-series/histogram-series";
import { HistogramSeriesOptions } from "~/components/chart/light-weight-charts/plugins/histogram-series/options";

import { ChartController, ChartControllerParams } from "./chart-controller";

interface Series {
  type: "Custom";
  options: HistogramSeriesOptions;
  data: HistogramData<UTCTimestamp>[];
}

export class HistogramChartController<
  T = TimeChartOptions,
  K = Time,
  N = Series
> extends ChartController<T, K, N> {
  series: ISeriesApi<
    "Custom",
    Time,
    HistogramData<Time> | WhitespaceData<Time>,
    HistogramSeriesOptions,
    DeepPartial<CustomStyleOptions & SeriesOptionsCommon>
  >[] = [];

  constructor(params: ChartControllerParams<T, K, N>) {
    super(params);

    if (params.series && params.series.length > 0) {
      for (const s of params.series) {
        const series = this.api.addCustomSeries(
          new HistogramSeries({
            ...(s as Series).options,
          })
        );

        series.setData((s as Series).data);

        this.series.push(series);
      }
    }
  }

  override applyOptions(params: Partial<ChartControllerParams<T, K, N>>): void {
    super.applyOptions(params);

    if (params.series && params.series.length > 0) {
      for (const [key, s] of params.series.entries()) {
        this.series[key].setData((s as Series).data);
      }
    }
  }
}
