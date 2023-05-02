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
  data: { price: number; time: number }[];
  annotations: Dec[];
  domain: [number, number];
}> = ({ data, annotations, domain }) => {
  // TODO: product-design-general tag Syed about adding custom mask is difficult
  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => {
        return (
          <XYChart
            key="line-chart"
            margin={{ top: 0, right: 0, bottom: 36, left: 50 }}
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
            <AnimatedGrid
              columns={false}
              // rows={false}
              numTicks={5}
            />
            <AnimatedLineSeries
              dataKey="price"
              data={data}
              curve={curveNatural}
              xAccessor={(d: { time: number; price: number }) => d?.time}
              yAccessor={(d: { time: number; price: number }) => d?.price}
              stroke={theme.colors.wosmongton["200"]}
            />
            {annotations.map((dec, i) => (
              <Annotation
                key={i}
                dataKey="depth"
                xAccessor={(d: { price: number; time: number }) => d.time}
                yAccessor={(d: { price: number; time: number }) => d.price}
                datum={{ price: Number(dec.toString()), time: 0 }}
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
              // showVerticalCrosshair
              // showHorizontalCrosshair
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
                console.log(tooltipData?.nearestDatum?.datum?.price.toFixed(4));
                return null;
                return (
                  <div className={`bg-osmoverse-800 p-2 text-xs leading-4`}>
                    <div className="text-white-full">
                      {tooltipData?.nearestDatum?.datum?.price.toFixed(4)}
                    </div>
                    <div className="text-osmoverse-300">
                      {`High: ${Math.max(...data.map((d) => d?.price)).toFixed(
                        4
                      )}`}
                    </div>
                    <div className="text-osmoverse-300">
                      {`Low: ${Math.min(...data.map((d) => d?.price)).toFixed(
                        4
                      )}`}
                    </div>
                  </div>
                );
              }}
            />
          </XYChart>
        );
      }}
    </ParentSize>
  );
};

export function calculateRangeFromHistoricalData(options: {
  data: { price: number; time: number }[];
  zoom?: number;
  min?: number;
  max?: number;
  padding?: number;
}): [number, number] {
  const { data, zoom = 1, min = Infinity, max = 0, padding = 0.2 } = options;
  const prices = data.map((d) => d.price);

  const chartMin = Math.max(0, Math.min(...prices));
  const chartMax = Math.max(...prices);
  const delta = Math.abs(chartMax - chartMin);

  const minWithPadding = Math.max(
    0,
    Math.min(chartMin - delta * padding, min - delta * padding)
  );
  const maxWithPadding = Math.max(
    chartMax + delta * padding,
    max + delta * padding
  );

  const zoomAdjustedMin =
    zoom > 1 ? minWithPadding / zoom : minWithPadding * zoom;
  const zoomAdjustedMax = maxWithPadding * zoom;

  return [zoomAdjustedMin, zoomAdjustedMax];
}

export default TokenPairHistoricalChart;
