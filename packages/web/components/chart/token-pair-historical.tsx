import { Dec } from "@keplr-wallet/unit";
import { curveNatural } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  Annotation,
  AnnotationConnector,
  AnnotationLineSubject,
  buildChartTheme,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import React, { FunctionComponent } from "react";

import { theme } from "~/tailwind.config";

const TokenPairHistoricalChart: FunctionComponent<{
  data: { close: number; time: number }[];
  annotations: Dec[];
  domain: [number, number];
  onPointerHover?: (price: number) => void;
  onPointerOut?: () => void;
}> = ({ data, annotations, domain, onPointerHover, onPointerOut }) => {
  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => {
        return (
          <XYChart
            key="line-chart"
            margin={{ top: 0, right: 0, bottom: 36, left: 48 }}
            height={height}
            width={width}
            xScale={{
              type: "utc",
              paddingInner: 0.5,
            }}
            yScale={{
              type: "linear",
              domain,
              zero: false,
            }}
            onPointerOut={onPointerOut}
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
          >
            <AnimatedAxis orientation="bottom" numTicks={4} />
            <AnimatedAxis orientation="left" numTicks={5} strokeWidth={0} />
            <AnimatedGrid columns={false} numTicks={5} />
            <AnimatedLineSeries
              key={data.length}
              dataKey="close"
              data={data}
              curve={curveNatural}
              xAccessor={(d: { time: number; close: number }) => d?.time}
              yAccessor={(d: { time: number; close: number }) => d?.close}
              stroke={theme.colors.wosmongton["200"]}
            />
            {annotations.map((dec, i) => (
              <Annotation
                key={i}
                dataKey="depth"
                xAccessor={(d: { close: number; time: number }) => d.time}
                yAccessor={(d: { close: number; time: number }) => d.close}
                datum={{ close: Number(dec.toString()), time: 0 }}
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
            <Tooltip
              snapTooltipToDatumX
              snapTooltipToDatumY
              detectBounds
              showDatumGlyph
              glyphStyle={{
                strokeWidth: 0,
                fill: theme.colors.wosmongton["200"],
              }}
              horizontalCrosshairStyle={{
                strokeWidth: 1,
                stroke: "#ffffff",
              }}
              verticalCrosshairStyle={{
                strokeWidth: 1,
                stroke: "#ffffff",
              }}
              renderTooltip={({ tooltipData }: any) => {
                const close = tooltipData?.nearestDatum?.datum?.close;
                if (close && onPointerHover) {
                  onPointerHover(close);
                }
                return <div></div>;
              }}
            />
          </XYChart>
        );
      }}
    </ParentSize>
  );
};

export default TokenPairHistoricalChart;
