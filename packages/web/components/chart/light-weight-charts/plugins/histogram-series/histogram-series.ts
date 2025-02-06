/**
 * The original code is from lightweight charts example repo:
 *
 * https://github.com/tradingview/lightweight-charts/blob/master/plugin-examples/src/plugins/stacked-bars-series/stacked-bars-series.ts
 */

import type {
  CustomSeriesPricePlotValues,
  ICustomSeriesPaneView,
  PaneRendererCustomData,
  Time,
  WhitespaceData,
} from "lightweight-charts";

import { type HistogramData } from "./data";
import { defaultOptions, type HistogramSeriesOptions } from "./options";
import { HistogramSeriesRenderer } from "./renderer";

export class HistogramSeries<TData extends HistogramData<Time>>
  implements ICustomSeriesPaneView<Time, TData, HistogramSeriesOptions>
{
  _renderer: HistogramSeriesRenderer<TData>;

  constructor(props: HistogramSeriesOptions) {
    this._renderer = new HistogramSeriesRenderer(props);
  }

  priceValueBuilder(plotRow: TData): CustomSeriesPricePlotValues {
    return [0, plotRow.value];
  }

  isWhitespace(data: TData | WhitespaceData): data is WhitespaceData {
    return !Boolean((data as Partial<TData>).time);
  }

  renderer(): HistogramSeriesRenderer<TData> {
    return this._renderer;
  }

  update(
    data: PaneRendererCustomData<Time, TData>,
    options: HistogramSeriesOptions
  ): void {
    this._renderer.update(data, options);
  }

  defaultOptions() {
    return defaultOptions;
  }
}
