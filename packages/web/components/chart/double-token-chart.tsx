import { Dec } from "@keplr-wallet/unit";
import { curveNatural } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import {
  AnimatedAreaSeries,
  AnimatedAxis,
  buildChartTheme,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import React from "react";

import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

export type Data = { time: number; close: number; denom: string };

export const DoubleTokenChart = ({
  data1,
  data2,
  height,
}: {
  data1: Data[];
  data2: Data[];
  height: number;
}) => {
  return (
    <ParentSize className="flex-shrink-1 flex-1 [&>svg]:overflow-visible">
      {({ width }) => (
        <XYChart
          key="line-chart"
          height={height}
          width={width}
          margin={{ top: 0, right: 0, bottom: 24, left: 0 }}
          xScale={{
            type: "time",
            paddingInner: 0.5,
          }}
          yScale={{
            type: "linear",
            zero: false,
          }}
          theme={buildChartTheme({
            backgroundColor: "transparent",
            colors: [
              theme.colors.ammelia["400"],
              theme.colors.wosmongton["300"],
            ],
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
          <AnimatedAxis orientation="bottom" numTicks={4} hideTicks hideZero />
          <AnimatedAxis orientation="bottom" numTicks={4} hideTicks hideZero />
          <>
            <AnimatedAreaSeries
              dataKey="OSMO"
              data={data1}
              xAccessor={(d: Data) => d?.time}
              yAccessor={(d: Data) => d?.close}
              fillOpacity={0.4}
              curve={curveNatural}
              fill="url(#gradient)"
            />
            <LinearGradient
              id="gradient"
              from={"#D779CF"}
              rotate={-8}
              fromOffset="13.08%"
              fromOpacity={1}
              toOpacity={0}
              toOffset="85.36%"
            />
          </>
          <>
            <AnimatedAreaSeries
              dataKey="ATOM"
              data={data2}
              xAccessor={(d: Data) => d?.time}
              yAccessor={(d: Data) => d?.close}
              fillOpacity={0.4}
              curve={curveNatural}
              fill="url(#gradient)"
            />
            <LinearGradient
              id="gradient"
              from={"#8C8AF9"}
              rotate={-8}
              fromOffset="13.08%"
              fromOpacity={1}
              toOpacity={0}
              toOffset="85.36%"
            />
          </>
          <Tooltip<Data>
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            detectBounds
            showDatumGlyph
            showSeriesGlyphs
            glyphStyle={{
              strokeWidth: 0,
              fill: theme.colors.wosmongton["200"],
            }}
            renderTooltip={({ tooltipData }) => {
              const close = tooltipData?.nearestDatum?.datum?.close;
              const time = tooltipData?.nearestDatum?.datum?.time;

              if (time && close) {
                const maxDecimals = Math.max(getDecimalCount(close), 2);
                const datumByKey = tooltipData.datumByKey;
                return (
                  <div className="flex gap-6 rounded-xl bg-osmoverse-1000 p-3 shadow-md">
                    {Object.keys(datumByKey).map((key) => (
                      <div key={key} className="flex flex-col">
                        <p className="text-body2">{key}</p>
                        <h6 className="text-h6 font-semibold text-white-full">
                          $
                          {formatPretty(new Dec(datumByKey[key].datum.close), {
                            maxDecimals,
                            notation: "compact",
                          }) || ""}
                        </h6>
                      </div>
                    ))}
                  </div>
                );
              }

              return <div></div>;
            }}
          />
        </XYChart>
      )}
    </ParentSize>
  );
};
