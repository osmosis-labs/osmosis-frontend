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

export interface ChartControllerParams<T = TimeChartOptions, K = Time> {
  options: DeepPartial<T>;
  series?: Series[];
  container: HTMLElement;
  onCrosshairMove?: (param: MouseEventParams<K>) => void;
}

export type ChartControllerEvents<T = TimeChartOptions, K = Time> = {
  crosshairMove: (param: MouseEventParams<K>) => void;
  init: (params: ChartControllerParams<T, K>) => void;
  remove: (params: ChartControllerParams<T, K>) => void;
};

export abstract class ChartController<T = TimeChartOptions, K = Time> {
  protected api: IChartApi;
  protected onCrosshairMove: ((param: MouseEventParams<K>) => void) | undefined;

  events = new EventEmitter<ChartControllerEvents<T, K>>();

  constructor(protected params: ChartControllerParams<T, K>) {
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

  applyOptions(params: Partial<ChartControllerParams<T, K>>) {
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
    this.api.remove();
    this.events.emit("remove", this.params);
  }
}
