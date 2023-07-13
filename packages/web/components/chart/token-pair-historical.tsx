import { Dec } from "@keplr-wallet/unit";
import { PriceRange } from "@osmosis-labs/stores";
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
  Margin,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { t, useTranslation } from "react-multi-lang";

import { ChartButton } from "~/components/buttons";
import { theme } from "~/tailwind.config";

import { Icon } from "../assets";

const TokenPairHistoricalChart: FunctionComponent<{
  data: { close: number; time: number }[];
  margin?: Partial<Margin>;
  annotations: Dec[];
  domain: [number, number];
  onPointerHover?: (price: number) => void;
  onPointerOut?: () => void;
}> = ({ data, annotations, domain, onPointerHover, onPointerOut }) => {
  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => (
        <XYChart
          key="line-chart"
          margin={{ top: 0, right: 0, bottom: 24, left: 28 }}
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
      )}
    </ParentSize>
  );
};

export default TokenPairHistoricalChart;

export const PriceChartHeader: FunctionComponent<{
  historicalRange: PriceRange;
  setHistoricalRange: (pr: PriceRange) => void;
  baseDenom: string;
  quoteDenom: string;
  hoverPrice: number;
  decimal: number;
  hideButtons?: boolean;
  classes?: {
    buttons?: string;
    priceHeaderClass?: string;
    priceSubheaderClass?: string;
    pricesHeaderContainerClass?: string;
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
  }) => {
    const t = useTranslation();

    return (
      <div className="flex flex-row">
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
            {hoverPrice.toFixed(decimal) || ""}
          </h4>
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
        </div>
        {!hideButtons && (
          <div
            className={classNames(
              "flex flex-1 justify-end gap-1 pr-2",
              classes?.buttons
            )}
          >
            <ChartButton
              label="1 hour"
              onClick={() => setHistoricalRange("1h")}
              selected={historicalRange === "1h"}
            />
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

export const ChartUnavailable: FunctionComponent = () => (
  <div className="gap m-auto flex items-center gap-2">
    <Icon id="alert-triangle" color={theme.colors.osmoverse["400"]} />
    <span className="subtitle1 text-osmoverse-400">
      {t("errors.chartUnavailable")}
    </span>
  </div>
);
