import { Dec } from "@keplr-wallet/unit";
import { PriceRange } from "@osmosis-labs/stores";
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
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ChartButton } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

const TokenPairHistoricalChart: FunctionComponent<{
  data: { close: number; time: number }[];
  margin?: Partial<Margin>;
  annotations: Dec[];
  domain: [number, number];
  onPointerHover?: (price: number) => void;
  onPointerOut?: () => void;
  showGradient?: boolean;
}> = ({
  data,
  annotations,
  domain,
  onPointerHover,
  onPointerOut,
  showGradient = true,
}) => {
  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => (
        <XYChart
          key="line-chart"
          margin={{ top: 0, right: 0, bottom: 24, left: 36 }}
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
          <AnimatedAxis orientation="bottom" numTicks={4} />
          <AnimatedAxis orientation="left" numTicks={5} strokeWidth={0} />
          <AnimatedGrid columns={false} numTicks={5} />

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
      )}
    </ParentSize>
  );
};

export default TokenPairHistoricalChart;

export const PriceChartHeader: FunctionComponent<{
  historicalRange: PriceRange;
  setHistoricalRange: (pr: PriceRange) => void;
  hoverPrice: number;
  decimal: number;
  fiatSymbol?: string;
  baseDenom?: string;
  quoteDenom?: string;
  hideButtons?: boolean;
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
    decimal,
    hideButtons,
    classes,
    fiatSymbol,
  }) => {
    const { t } = useTranslation();

    return (
      <div
        className={classNames(
          "flex flex-row",
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
              label="7 day"
              onClick={() => setHistoricalRange("7d")}
              selected={historicalRange === "7d"}
            />
            <ChartButton
              label="30 day"
              onClick={() => setHistoricalRange("1mo")}
              selected={historicalRange === "1mo"}
            />
            <ChartButton
              label="1 year"
              onClick={() => setHistoricalRange("1y")}
              selected={historicalRange === "1y"}
            />
          </div>
        )}
      </div>
    );
  }
);

export const ChartUnavailable: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="gap m-auto flex items-center gap-2">
      <Icon id="alert-triangle" color={theme.colors.osmoverse["400"]} />
      <span className="subtitle1 text-osmoverse-400">
        {t("errors.chartUnavailable")}
      </span>
    </div>
  );
};
