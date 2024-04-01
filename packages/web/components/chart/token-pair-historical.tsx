import { Dec } from "@keplr-wallet/unit";
import { curveNatural } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import {
  AnimatedAreaSeries,
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  Annotation,
  AnnotationConnector,
  AnnotationLineSubject,
  buildChartTheme,
  Margin,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, memo } from "react";

import { Icon } from "~/components/assets";
import { ChartButton } from "~/components/ui/button";
import { type PriceRange, useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { FormatOptions, formatPretty } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

const TokenPairHistoricalChart: FunctionComponent<{
  data: { close: number; time: number }[];
  margin?: Partial<Margin>;
  annotations: Dec[];
  domain: [number, number];
  onPointerHover?: (price: number) => void;
  onPointerOut?: () => void;
  showGradient?: boolean;
  /**
   * Renders a more compact graph with less information on the screen
   */
  minimal?: boolean;
  /**
   * specifies the tick count of the horizontal asset
   */
  xNumTicks?: number;
  /**
   * Enable tooltip rendering
   */
  showTooltip?: boolean;
  fiatSymbol?: string;
}> = memo(
  ({
    data,
    annotations,
    domain,
    onPointerHover,
    onPointerOut,
    showGradient = true,
    minimal = false,
    xNumTicks = 4,
    showTooltip = false,
    fiatSymbol,
  }) => (
    <ParentSize
      className={`flex-shrink-1 flex-1 ${
        !minimal ? "overflow-hidden" : "[&>svg]:overflow-visible"
      }`}
    >
      {({ height, width }) => (
        <XYChart
          key="line-chart"
          margin={
            minimal
              ? { top: 0, right: 0, bottom: 24, left: 0 }
              : { top: 0, right: 0, bottom: 24, left: 36 }
          }
          height={height}
          width={width}
          xScale={{
            type: "time",
            paddingInner: 0.5,
          }}
          yScale={{
            type: "linear",
            domain,
            zero: false,
          }}
          onPointerOut={onPointerOut}
          onPointerMove={(tooltipData) => {
            const datum = tooltipData.datum as any;
            const close = datum.close;

            if (close && onPointerHover) {
              onPointerHover(close);
            }
          }}
          theme={buildChartTheme({
            backgroundColor: "transparent",
            colors: showGradient ? [theme.colors.wosmongton["300"]] : ["white"],
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
          <AnimatedAxis
            orientation="bottom"
            numTicks={xNumTicks}
            hideTicks={minimal}
            hideZero={minimal}
          />
          {!minimal && (
            <AnimatedAxis orientation="left" numTicks={5} strokeWidth={0} />
          )}
          {!minimal && <AnimatedGrid columns={false} numTicks={5} />}

          {showGradient ? (
            <>
              <AnimatedAreaSeries
                dataKey="close"
                data={data}
                xAccessor={(d: { time: number; close: number }) => d?.time}
                yAccessor={(d: { time: number; close: number }) => d?.close}
                fillOpacity={0.4}
                curve={curveNatural}
                fill="url(#gradient)"
              />
              <LinearGradient
                id="gradient"
                from={theme.colors.chartGradientPrimary}
                to={theme.colors.chartGradientSecondary}
                rotate={-8}
                fromOffset="13.08%"
                fromOpacity={1}
                toOpacity={0}
                toOffset="85.36%"
              />
            </>
          ) : (
            <AnimatedLineSeries
              key={data.length}
              dataKey="close"
              data={data}
              curve={curveNatural}
              xAccessor={(d: { time: number; close: number }) => d?.time}
              yAccessor={(d: { time: number; close: number }) => d?.close}
              stroke={theme.colors.wosmongton["200"]}
            />
          )}
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
            detectBounds
            showDatumGlyph
            horizontalCrosshairStyle={{
              strokeWidth: 2,
              strokeDasharray: "5 5",
              opacity: 0.17,
              stroke: theme.colors.osmoverse[300],
            }}
            verticalCrosshairStyle={{
              strokeWidth: 2,
              strokeDasharray: "5 5",
              opacity: 0.17,
              stroke: theme.colors.osmoverse[300],
            }}
            showVerticalCrosshair={true}
            renderTooltip={({ tooltipData }: any) => {
              const close = tooltipData?.nearestDatum?.datum?.close;
              const time = tooltipData?.nearestDatum?.datum?.time;

              if (showTooltip && time && close) {
                const date = dayjs(time).format("MMM Do, hh:mma");
                const minimumDecimals = 2;
                const maxDecimals = Math.max(
                  getDecimalCount(close),
                  minimumDecimals
                );

                const closeDec = new Dec(close);

                /**
                 * We need to know how long the integer part of the number is in order to calculate then how many decimal places.
                 */
                const integerPartLength =
                  closeDec.truncate().toString().length ?? 0;

                /**
                 * If a number is less then $100, we only show 4 significant digits, examples:
                 *  OSMO: $1.612
                 *  AXL: $0.9032
                 *  STARS: $0.03673
                 *  HUAHUA: $0.00001231
                 *
                 * If a number is greater or equal to $100, we show a dynamic significant digits based on it's integer part, examples:
                 * BTC: $47,334.21
                 * ETH: $3,441.15
                 */
                const maximumSignificantDigits = closeDec.lt(new Dec(100))
                  ? 4
                  : integerPartLength + 2;

                return (
                  <div className="relative flex flex-col gap-1 rounded-xl bg-osmoverse-1000 p-3 shadow-md">
                    <h6 className="text-h6 font-semibold text-white-full">
                      {fiatSymbol}
                      {formatPretty(new Dec(close), {
                        maxDecimals,
                        notation: "standard",
                        maximumSignificantDigits,
                        minimumSignificantDigits: maximumSignificantDigits,
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                        disabledTrimZeros: true,
                      }) || ""}
                    </h6>

                    <p className="text-caption font-medium text-osmoverse-200">
                      {date}
                    </p>
                  </div>
                );
              }

              return <div></div>;
            }}
          />
        </XYChart>
      )}
    </ParentSize>
  )
);

export default TokenPairHistoricalChart;

export const PriceChartHeader: FunctionComponent<{
  historicalRange: PriceRange;
  setHistoricalRange: (pr: PriceRange) => void;
  hoverPrice: number;
  decimal: number;
  formatOpts?: FormatOptions;
  fiatSymbol?: string;
  baseDenom?: string;
  quoteDenom?: string;
  hideButtons?: boolean;
  showAllRange?: boolean;
  classes?: {
    buttons?: string;
    priceHeaderClass?: string;
    priceSubheaderClass?: string;
    pricesHeaderContainerClass?: string;
    pricesHeaderRootContainer?: string;
  };
}> = observer(
  ({
    historicalRange,
    setHistoricalRange,
    baseDenom,
    quoteDenom,
    hoverPrice,
    formatOpts,
    decimal,
    hideButtons,
    classes,
    fiatSymbol,
    showAllRange = false,
  }) => {
    const { t } = useTranslation();

    return (
      <div
        className={classNames(
          "flex flex-row lg:flex-col-reverse sm:items-start sm:gap-y-4",
          classes?.pricesHeaderRootContainer
        )}
      >
        <div
          className={classNames(
            "flex flex-1 flex-row",
            classes?.pricesHeaderContainerClass
          )}
        >
          <h4
            className={classNames(
              "row-span-2 pr-1 font-caption sm:text-h5",
              classes?.priceHeaderClass
            )}
          >
            {fiatSymbol}
            {formatPretty(new Dec(hoverPrice), {
              maxDecimals: decimal,
              notation: "compact",
              ...formatOpts,
            }) || ""}
          </h4>
          {baseDenom && quoteDenom ? (
            <div
              className={classNames(
                "flex flex-col justify-center font-caption",
                classes?.priceSubheaderClass
              )}
            >
              <div className="text-caption text-osmoverse-300">
                {t("addConcentratedLiquidity.currentPrice")}
              </div>
              <div className="whitespace-nowrap text-caption text-osmoverse-300">
                {t("addConcentratedLiquidity.basePerQuote", {
                  base: baseDenom,
                  quote: quoteDenom,
                })}
              </div>
            </div>
          ) : undefined}
        </div>
        {!hideButtons && (
          <div
            className={classNames(
              "flex flex-1 justify-end gap-1 pr-2",
              classes?.buttons
            )}
          >
            <ChartButton
              label={t("tokenInfos.chart.xHour", { h: "1" })}
              onClick={() => setHistoricalRange("1h")}
              selected={historicalRange === "1h"}
            />
            <ChartButton
              label={t("tokenInfos.chart.xDay", { d: "1" })}
              onClick={() => setHistoricalRange("1d")}
              selected={historicalRange === "1d"}
            />
            <ChartButton
              label={t("tokenInfos.chart.xDay", { d: "7" })}
              onClick={() => setHistoricalRange("7d")}
              selected={historicalRange === "7d"}
            />
            <ChartButton
              label={t("tokenInfos.chart.xDay", { d: "30" })}
              onClick={() => setHistoricalRange("1mo")}
              selected={historicalRange === "1mo"}
            />
            <ChartButton
              label={t("tokenInfos.chart.xYear", { y: "1" })}
              onClick={() => setHistoricalRange("1y")}
              selected={historicalRange === "1y"}
            />
            {showAllRange ? (
              <ChartButton
                label={t("tokenInfos.chart.all", { y: "1" })}
                onClick={() => setHistoricalRange("all")}
                selected={historicalRange === "all"}
              />
            ) : (
              false
            )}
          </div>
        )}
      </div>
    );
  }
);

export const ChartUnavailable: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="gap m-auto flex items-center gap-2 px-8 md:px-6">
      <Icon id="alert-triangle" color={theme.colors.osmoverse["400"]} />
      <span className="subtitle1 text-osmoverse-400">
        {t("errors.chartUnavailable")}
      </span>
    </div>
  );
};
