import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import {
  AnimatedGrid,
  Annotation,
  AnnotationCircleSubject,
  AnnotationConnector,
  AnnotationLineSubject,
  BarSeries,
  buildChartTheme,
  XYChart,
} from "@visx/xychart";
import React, { FunctionComponent } from "react";

import { theme } from "~/tailwind.config";

export type DepthData = {
  price: number;
  depth: number;
};

const ConcentratedLiquidityDepthChart: FunctionComponent<{
  min?: number;
  max?: number;
  yRange: [number, number];
  xRange: [number, number];
  data: DepthData[];
  annotationDatum?: DepthData;
  onMoveMax?: (value: number) => void;
  onMoveMin?: (value: number) => void;
  onSubmitMax?: (value: number) => void;
  onSubmitMin?: (value: number) => void;
  offset?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  horizontal?: boolean;
  fullRange?: boolean;
  rangeAnnotation?: DepthData[];
}> = ({
  data,
  min,
  max,
  yRange,
  xRange,
  annotationDatum,
  rangeAnnotation = [],
  onMoveMin,
  onMoveMax,
  onSubmitMin,
  onSubmitMax,
  offset,
  horizontal = true,
  fullRange = false,
}) => {
  const xMax = xRange[1];
  const showMinDragHandler =
    min !== undefined && Boolean(onMoveMin) && Boolean(onSubmitMin);
  const showMaxDragHandler =
    max !== undefined && Boolean(onMoveMax) && Boolean(onSubmitMax);

  const { top = 0, right = 0, bottom = 0, left = 0 } = offset || {};

  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => {
        const yScale = scaleLinear({
          range: [top, height - bottom],
          domain: yRange.slice().reverse(),
          zero: false,
        });

        return (
          <XYChart
            key="bar-chart"
            captureEvents={false}
            margin={{ top, right, bottom, left }}
            height={height}
            width={width}
            xScale={{
              type: "linear",
              domain: xRange,
            }}
            yScale={{
              type: "linear",
              domain: yRange,
              zero: false,
            }}
            theme={buildChartTheme({
              backgroundColor: "transparent",
              colors: ["white"],
              gridColor: theme.colors.osmoverse["600"],
              gridColorDark: theme.colors.osmoverse["300"],
              svgLabelSmall: {
                fill: theme.colors.osmoverse["300"],
                fontSize: 12,
                fontWeight: 500,
              },
              svgLabelBig: {
                fill: theme.colors.osmoverse["300"],
                fontSize: 12,
                fontWeight: 500,
              },
              tickLength: 1,
              xAxisLineStyles: {
                strokeWidth: 0,
              },
              xTickLineStyles: {
                strokeWidth: 0,
              },
              yAxisLineStyles: {
                strokeWidth: 0,
              },
            })}
            horizontal={horizontal}
          >
            <AnimatedGrid columns={false} rows={false} numTicks={5} />
            <BarSeries
              dataKey="depth"
              data={data}
              xAccessor={(d: DepthData) => d?.depth}
              yAccessor={(d: DepthData) => d?.price}
              colorAccessor={() => theme.colors.barFill}
            />
            {annotationDatum && (
              <Annotation
                dataKey="depth"
                xAccessor={(d: DepthData) => d.depth}
                yAccessor={(d: DepthData) => d.price}
                datum={annotationDatum}
              >
                <AnnotationConnector />
                <AnnotationCircleSubject
                  stroke={theme.colors.wosmongton["200"]}
                  // @ts-ignore
                  strokeWidth={4}
                  radius={2}
                />
                <AnnotationLineSubject
                  orientation="horizontal"
                  stroke={theme.colors.wosmongton["200"]}
                  strokeWidth={3}
                />
              </Annotation>
            )}
            {Boolean(rangeAnnotation.length) &&
              rangeAnnotation.map((datum, i) => (
                <Annotation
                  key={i}
                  dataKey="depth"
                  xAccessor={(d) => d.depth}
                  yAccessor={(d) => d.price}
                  datum={datum}
                >
                  <AnnotationConnector />
                  <AnnotationLineSubject
                    orientation="horizontal"
                    stroke={theme.colors.wosmongton["200"]}
                    strokeWidth={2}
                    strokeDasharray={4}
                  />
                </Annotation>
              ))}
            {showMaxDragHandler && (
              <DragContainer
                key={"max:" + yRange.join("_")}
                defaultValue={fullRange ? yRange[1] * 0.95 : max}
                length={xMax}
                scale={yScale}
                stroke={theme.colors.wosmongton["500"]}
                onMove={onMoveMax}
                onSubmit={onSubmitMax}
              />
            )}
            {showMinDragHandler && (
              <DragContainer
                key={"min:" + yRange.join("_")}
                defaultValue={fullRange ? yRange[0] * 1.05 : min}
                length={xMax}
                scale={yScale}
                stroke={theme.colors.bullish["500"]}
                onMove={onMoveMin}
                onSubmit={onSubmitMin}
              />
            )}
            <style>{`
              .visx-bar {
                stroke: ${theme.colors.barFill};
                stroke-width: 3px;
              }
            `}</style>
          </XYChart>
        );
      }}
    </ParentSize>
  );
};

const DragContainer: FunctionComponent<{
  defaultValue?: number;
  length?: number;
  scale: any;
  onMove?: (value: number) => void;
  onSubmit?: (value: number) => void;
  stroke: string;
}> = (props) => (
  <Annotation
    dataKey="depth"
    xAccessor={(d: any) => d?.depth}
    yAccessor={(d: any) => d?.tick}
    datum={{ tick: props.defaultValue, depth: props.length }}
    canEditSubject
    canEditLabel={false}
    onDragMove={({ event, ...nextPos }) => {
      if (props.onMove) {
        const val = props.scale.invert(nextPos.y);
        props.onMove(+Math.max(0, val));
      }
    }}
    onDragEnd={({ event, ...nextPos }) => {
      if (props.onSubmit) {
        const val = props.scale.invert(nextPos.y);
        props.onSubmit(+Math.max(0, val));
      }
    }}
    editable
  >
    <AnnotationConnector />
    <AnnotationCircleSubject
      stroke={props.stroke}
      // @ts-ignore
      strokeWidth={8}
      radius={2}
    />
    <AnnotationLineSubject
      orientation="horizontal"
      stroke={props.stroke}
      strokeWidth={3}
    />
  </Annotation>
);

// needed for next/dynamic to avoid including visx in main bundle
export default ConcentratedLiquidityDepthChart;
