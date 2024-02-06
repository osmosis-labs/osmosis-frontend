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
import { useMemo } from "react";

import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

export type Data = {
  time: number;
  close: number;
  denom: string;
  originalClose?: number;
};

export interface DoubleTokenChartProps {
  data: Data[][];
  height: number;
}

// TODO: support multiple token using array, for future support and simple logic
export const DoubleTokenChart = ({ data, height }: DoubleTokenChartProps) => {
  const [primaryData, secondaryData] = data;

  const [primaryMin, primaryMax] = useMemo(() => {
    const max = Math.max(...primaryData.map((d) => d.close));
    const min = Math.min(...primaryData.map((d) => d.close));

    return [min, max];
  }, [primaryData]);

  const [secondaryMin, secondaryMax] = useMemo(() => {
    const max = Math.max(...secondaryData.map((d) => d.close));
    const min = Math.min(...secondaryData.map((d) => d.close));

    return [min, max];
  }, [secondaryData]);

  /**
   * Here we normalize data in a range between zero and one.
   */
  const convertedPrimaryData = useMemo(
    () =>
      primaryData.map((data) => {
        return {
          ...data,
          close: (data.close - primaryMin) / (primaryMax - primaryMin),
          originalClose: data.close,
        };
      }),
    [primaryData, primaryMin, primaryMax]
  );

  /**
   * Here we normalize data in a range between zero and one.
   */
  const convertedSecondaryData = useMemo(
    () =>
      secondaryData.map((data) => {
        return {
          ...data,
          close: (data.close - secondaryMin) / (secondaryMax - secondaryMin),
          originalClose: data.close,
        };
      }),
    [secondaryData, secondaryMax, secondaryMin]
  );

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
          <AnimatedAxis orientation="bottom" numTicks={2} hideTicks hideZero />
          {convertedPrimaryData.length > 0 ? (
            <>
              <AnimatedAreaSeries
                dataKey={convertedPrimaryData[0].denom}
                data={convertedPrimaryData}
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
          ) : (
            false
          )}
          {convertedSecondaryData.length > 0 ? (
            <>
              <AnimatedAreaSeries
                dataKey={convertedSecondaryData[0].denom}
                data={convertedSecondaryData}
                xAccessor={(d: Data) => d?.time}
                yAccessor={(d: Data) => d?.close}
                fillOpacity={0.4}
                curve={curveNatural}
                fill="url(#secondaryGradient)"
              />
              <LinearGradient
                id="secondaryGradient"
                from={"#D779CF"}
                rotate={-8}
                fromOffset="13.08%"
                fromOpacity={1}
                toOpacity={0}
                toOffset="85.36%"
              />
            </>
          ) : (
            false
          )}

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
            renderTooltip={({ tooltipData, colorScale }) => {
              const close =
                tooltipData?.nearestDatum?.datum?.originalClose ??
                tooltipData?.nearestDatum?.datum?.close;
              const time = tooltipData?.nearestDatum?.datum?.time;

              if (time && close) {
                const maxDecimals = Math.max(getDecimalCount(close), 2);
                const datumByKey = tooltipData.datumByKey;

                return (
                  <div className="flex gap-6 rounded-xl bg-osmoverse-1000 p-3 shadow-md">
                    {Object.keys(datumByKey).map((key) => (
                      <div key={key} className="flex flex-col">
                        <p
                          className="text-body2 font-medium"
                          style={{ color: colorScale?.(key) }}
                        >
                          {key}
                        </p>
                        <h6 className="text-h6 font-semibold text-white-full">
                          $
                          {formatPretty(
                            new Dec(
                              datumByKey[key].datum.originalClose ??
                                datumByKey[key].datum.close
                            ),
                            {
                              maxDecimals,
                              notation: "compact",
                            }
                          ) || ""}
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
