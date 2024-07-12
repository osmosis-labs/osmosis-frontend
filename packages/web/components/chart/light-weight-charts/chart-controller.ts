import EventEmitter from "eventemitter3";
import {
  createChart,
  DeepPartial,
  IChartApi,
  MouseEventParams,
  SeriesDataItemTypeMap,
  SeriesOptionsMap,
  Time,
  TimeChartOptions,
} from "lightweight-charts";

export interface Series {
  type: keyof SeriesOptionsMap;
  options: DeepPartial<SeriesOptionsMap[keyof SeriesOptionsMap]>;
  data: SeriesDataItemTypeMap<Time>[keyof SeriesOptionsMap][];
}

export interface ChartControllerParams<
  T = TimeChartOptions,
  K = Time,
  N = Series
> {
  options: DeepPartial<T>;
  series?: N[];
  container: HTMLElement;
  onCrosshairMove?: (param: MouseEventParams<K>) => void;
}

export type ChartControllerEvents<
  T = TimeChartOptions,
  K = Time,
  N = Series
> = {
  crosshairMove: (param: MouseEventParams<K>) => void;
  init: (params: ChartControllerParams<T, K, N>) => void;
  remove: (params: ChartControllerParams<T, K, N>) => void;
};

export abstract class ChartController<
  T = TimeChartOptions,
  K = Time,
  N = Series
> {
  protected api: IChartApi;
  protected onCrosshairMove: ((param: MouseEventParams<K>) => void) | undefined;

  events = new EventEmitter<ChartControllerEvents<T, K, N>>();

  constructor(protected params: ChartControllerParams<T, K, N>) {
    const { options, container, onCrosshairMove } = params;

    this.onCrosshairMove = onCrosshairMove;

    this.api = createChart(container, {
      width: container?.clientWidth,
      ...options,
    });

    this.api.timeScale().fitContent();

    this.api.subscribeCrosshairMove((param) => {
      this.onCrosshairMove?.(param as never);
      this.events.emit("crosshairMove", param as never);
    });

    this.events.emit("init", this.params);
  }

  applyOptions(params: Partial<ChartControllerParams<T, K, N>>) {
    if (params.options) {
      this.api.applyOptions(params.options);
    }

    if (params.onCrosshairMove) {
      this.onCrosshairMove = params.onCrosshairMove;
    }
  }

  resize() {
    this.api.applyOptions({
      ...this.params.options,
      width: this.params.container.clientWidth,
    });

    this.api.timeScale().fitContent();
  }

  remove() {
    this.api.unsubscribeCrosshairMove((param) => {
      this.onCrosshairMove?.(param as never);
      this.events.emit("crosshairMove", param as never);
    });
    this.api.remove();
    this.events.emit("remove", this.params);
  }
}
