import {
  BitmapCoordinatesRenderingScope,
  CanvasRenderingTarget2D,
} from "fancy-canvas";
import {
  ICustomSeriesPaneRenderer,
  PaneRendererCustomData,
  PriceToCoordinateConverter,
  Time,
} from "lightweight-charts";

import {
  calculateColumnPositionsInPlace,
  ColumnPosition,
} from "../../helpers/dimensions/columns";
import { positionsBox } from "../../helpers/dimensions/positions";
import { HistogramData } from "./data";
import { HistogramSeriesOptions } from "./options";

interface HistogramBarItem {
  x: number;
  ys: number[];
  column?: ColumnPosition;
}

function cumulativeBuildUp(arr: number[]): number[] {
  let sum = 0;
  return arr.map((value) => {
    sum += value;
    return sum;
  });
}

export class HistogramSeriesRenderer<TData extends HistogramData>
  implements ICustomSeriesPaneRenderer
{
  private _data: PaneRendererCustomData<Time, TData> | null = null;
  private _options: HistogramSeriesOptions | null = null;
  private _props: HistogramSeriesOptions;

  constructor(props: HistogramSeriesOptions) {
    this._props = props;
  }

  draw(
    target: CanvasRenderingTarget2D,
    priceConverter: PriceToCoordinateConverter
  ): void {
    target.useBitmapCoordinateSpace((scope) =>
      this._drawImpl(scope, priceConverter)
    );
  }

  update(
    data: PaneRendererCustomData<Time, TData>,
    options: HistogramSeriesOptions
  ): void {
    this._data = data;
    this._options = options;
  }

  private _drawImpl(
    renderingScope: BitmapCoordinatesRenderingScope,
    priceToCoordinate: PriceToCoordinateConverter
  ): void {
    if (
      !this._data ||
      this._data.bars.length === 0 ||
      !this._data.visibleRange ||
      !this._options
    ) {
      return;
    }

    const ctx = renderingScope.context;
    const bars = this._prepareBars(priceToCoordinate);

    calculateColumnPositionsInPlace(
      bars,
      this._data.barSpacing,
      renderingScope.horizontalPixelRatio,
      this._data.visibleRange.from,
      this._data.visibleRange.to
    );

    const zeroY = priceToCoordinate(0) ?? 0;
    for (
      let i = this._data.visibleRange.from;
      i < this._data.visibleRange.to;
      i++
    ) {
      const stack = bars[i];
      const column = stack.column;
      if (!column) return;

      this._drawStack(ctx, stack, column, zeroY, renderingScope);
    }
  }

  private _prepareBars(
    priceToCoordinate: PriceToCoordinateConverter
  ): HistogramBarItem[] {
    return this._data!.bars.map((bar) => {
      return {
        x: bar.x,
        ys: cumulativeBuildUp([bar.originalData.value]).map(
          (value) => priceToCoordinate(value) ?? 0
        ),
      };
    });
  }

  private _drawStack(
    ctx: CanvasRenderingContext2D,
    stack: HistogramBarItem,
    column: ColumnPosition,
    zeroY: number,
    renderingScope: BitmapCoordinatesRenderingScope
  ): void {
    const { horizontalPixelRatio, verticalPixelRatio } = renderingScope;
    const { barSpacing } = this._data!;
    const options = this._options!;
    const margin = this._calculateMargin(
      horizontalPixelRatio,
      column,
      barSpacing
    );

    this._drawTotalVolumeBar(
      ctx,
      column,
      stack,
      zeroY,
      margin,
      verticalPixelRatio
    );

    ctx.globalCompositeOperation = "source-atop";
    this._drawStackBoxes(
      ctx,
      stack,
      column,
      zeroY,
      margin,
      options,
      verticalPixelRatio
    );
    ctx.globalCompositeOperation = "source-over";
  }

  private _calculateMargin(
    horizontalPixelRatio: number,
    column: ColumnPosition,
    barSpacing: number
  ): number {
    const width = Math.min(
      Math.max(horizontalPixelRatio, column.right - column.left),
      barSpacing * horizontalPixelRatio
    );
    return width * 0.08;
  }

  private _drawTotalVolumeBar(
    ctx: CanvasRenderingContext2D,
    column: ColumnPosition,
    stack: HistogramBarItem,
    zeroY: number,
    margin: number,
    verticalPixelRatio: number
  ): void {
    const totalBox = positionsBox(
      zeroY,
      stack.ys[stack.ys.length - 1],
      verticalPixelRatio
    );

    ctx.beginPath();
    ctx.roundRect(
      column.left + margin,
      totalBox.position,
      column.right - column.left - margin,
      totalBox.length,
      6
    );
    ctx.fill();
  }

  private _drawStackBoxes(
    ctx: CanvasRenderingContext2D,
    stack: HistogramBarItem,
    column: ColumnPosition,
    zeroY: number,
    margin: number,
    options: HistogramSeriesOptions,
    verticalPixelRatio: number
  ): void {
    let previousY = zeroY;

    stack.ys.forEach((y, index) => {
      const color =
        this._props.colors && this._props.colors.length > 0
          ? this._props.colors[index % options.colors.length]
          : this._props.color;
      const stackBoxPositions = positionsBox(previousY, y, verticalPixelRatio);

      ctx.fillStyle = color;
      ctx.fillRect(
        column.left + margin,
        stackBoxPositions.position,
        column.right - column.left - margin,
        stackBoxPositions.length
      );

      previousY = y;
    });
  }
}
