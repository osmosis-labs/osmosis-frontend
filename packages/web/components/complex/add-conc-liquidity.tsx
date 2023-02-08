import { FunctionComponent, ReactNode } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PricePretty, CoinPretty } from "@keplr-wallet/unit";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
// import { MenuToggle } from "../../components/control";
// import { Token } from "../../components/assets";
// import { InputBox } from "../../components/input";
// import { Info } from "../../components/alert";
// import { PoolTokenSelect } from "../../components/control/pool-token-select";
import { CustomClasses } from "../types";
// import { Button } from "../buttons";
import { useTranslation } from "react-multi-lang";

import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedGrid,
  AnimatedLineSeries,
  AnimatedBarSeries,
  XYChart,
  Tooltip,
  buildChartTheme,
} from '@visx/xychart/lib/index.js';

import {ParentSize} from "@visx/responsive";
import {theme} from "../../tailwind.config";

const data1 = makeData();

const accessors = {
  xAccessor: (d: any) => d.time,
  yAccessor: (d: any) => d.price,
};

function makeData(lastPrice = 1) {
  let lp = lastPrice;
  let date = Date.now();
  return Array(168)
    .fill(null)
    .map((_, i) => {
      const diffPer = !i ? 0 : (Math.random() - .5) / (.5 / .01);
      const newLp = lp + lp * diffPer;
      lp = newLp;
      return {
        time: date - i * 3600000,
        price: newLp,
      };
    });
}

function getRangeFromData(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const last = data[0];
  const diff = Math.max(
    Math.max(Math.abs(last - max), Math.abs(last - min)),
    last * 0.25,
  );

  return {
    min: Math.max(0, last - diff),
    max: last + diff,
  };
}

function getDepthFromRange(min: number, max: number) {
  const priceTick = (max - min) / 16;
  const val = [];
  for (let i = 0; i < 16; i++) {
    const depth = Math.floor(Math.random() * 1000);
    val.push({
      tick: min + priceTick * i,
      depth,
    });
  }
  return val;
}

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(
  ({ className, addLiquidityConfig, actionButton, getFiatValue }) => {
    const { chainStore } = useStore();
    const { isMobile } = useWindowSize();
    const t = useTranslation();

    return (
      <div className={classNames("flex flex-col gap-8", className)}>
        <div className="flex flex-row align-center relative">
          <div className="h-full flex items-center absolute left-0 text-sm">
            {"<- Back"}
          </div>
          <div className="flex-1 text-center text-lg">
            Add liquidity
          </div>
          <div className="h-full flex items-center absolute right-0 text-xs font-subtitle2 text-osmoverse-200">
            Prices shown in ATOM  per OSMO
          </div>
        </div>
        <div className="flex flex-col">
          <div className="px-2 py-1 text-sm">Price Range</div>
          <div className="flex flex-row">
            <div className="flex flex-col flex-1 flex-shrink-1 w-0 bg-osmoverse-700 h-[20.1875rem]">
              <div className="flex flex-row">
                <div className="flex-1 flex flex-row p-2">
                  <div className="row-span-2">10.12</div>
                  <div className="flex flex-col">
                    <div>current price</div>
                    <div>ATOM per OSMO</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-row justify-end p-2">
                  <div className="flex flex-row items-center justify-center bg-osmoverse-800 text-xs h-6 w-14 rounded-md">7 day</div>
                  <div className="flex flex-row items-center justify-center bg-osmoverse-800 text-xs h-6 w-14 rounded-md">30 day</div>
                  <div className="flex flex-row items-center justify-center bg-osmoverse-800 text-xs h-6 w-14 rounded-md">1 year</div>
                </div>
              </div>
              <LineChart />
            </div>
            <div className="flex flex-col flex-1 flex-shrink-1 w-0 bg-osmoverse-700 h-[20.1875rem]">
              <BarChart />
            </div>
          </div>
        </div>
        <div>

        </div>
        <div>

        </div>

        {actionButton}
      </div>
    );
  }
);

function LineChart() {
  const yRange = getRangeFromData(data1.map(accessors.yAccessor));

  return (
    <ParentSize className="flex-1 flex-shrink-1 overflow-hidden">
      {({height, width}) => {
        return (
          <XYChart
            margin={{ top: 0, right: 0, bottom: 36, left: 50 }}
            height={height}
            width={width}
            xScale={{
              type: 'utc',
              paddingInner: 0.5,
            }}
            yScale={{
              type: 'linear',
              // domain: [
              //   Math.max(...data1.map(accessors.yAccessor)),
              //   Math.min(...data1.map(accessors.yAccessor)),
              // ],
              // range: [0, height],
              domain: [yRange.min, yRange.max],
              zero: false,
            }}
            theme={buildChartTheme({
              backgroundColor: "#f05454",
              colors: ["#e8e8e8"],
              gridColor: theme.colors.osmoverse['600'],
              gridColorDark: theme.colors.osmoverse['300'],
              svgLabelSmall: {
                fill: theme.colors.osmoverse['300'],
                fontSize: 12,
                fontWeight: 500,
              },
              svgLabelBig: {
                fill: theme.colors.osmoverse['300'],
                fontSize: 12,
                fontWeight: 500,
              },
              tickLength: 4,
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
              numTicks={4}
            />
            <AnimatedAxis
              orientation="left"
              numTicks={5}
              strokeWidth={0}
            />
            <AnimatedGrid
              columns={false}
              // rows={false}
              numTicks={5}
            />
            <AnimatedLineSeries
              dataKey="Line 1"
              data={data1}
              {...accessors}
              stroke={theme.colors.wosmongton['200']}
            />
            <Tooltip
              showVerticalCrosshair
              snapTooltipToDatumX
              renderTooltip={({ tooltipData, colorScale }) => (
                <>
                  <div style={{ color: colorScale('price') }}>{'price'}</div>
                  <br />
                  <div>hello</div>
                </>
              )}
            />
          </XYChart>
        );
      }}
    </ParentSize>
  );
}

function BarChart() {
  const yRange = getRangeFromData(data1.map(accessors.yAccessor));
  const depthData = getDepthFromRange(yRange.min, yRange.max);

  return (
    <ParentSize className="flex-1 flex-shrink-1 overflow-hidden">
      {({height, width}) => {
        return (
          <XYChart
            margin={{ top: 64, right: 36, bottom: 36, left: 0 }}
            height={height}
            width={width / 2}
            xScale={{
              type: 'linear',
              paddingInner: 0.5,
            }}
            yScale={{
              type: 'band',
              domain: depthData.map(d => d.tick),
              zero: false,
            }}
            theme={buildChartTheme({
              backgroundColor: "#f05454",
              colors: ["#e8e8e8"],
              gridColor: theme.colors.osmoverse['600'],
              gridColorDark: theme.colors.osmoverse['300'],
              svgLabelSmall: {
                strokeWidth: 0,
                fill: theme.colors.osmoverse['300'],
                fontSize: 12,
                fontWeight: 500,
              },
              svgLabelBig: {
                strokeWidth: 0,
                fill: 'transparent',
              },
              tickLength: 4,
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
            {/* Uncomment when testing alignment */}
            {/*<AnimatedAxis*/}
            {/*  orientation="right"*/}
            {/*  numTicks={5}*/}
            {/*  strokeWidth={0}*/}
            {/*/>*/}
            <AnimatedGrid
              columns={false}
              rows={false}
              numTicks={5}
            />
            <AnimatedBarSeries
              dataKey="Bar 1"
              data={depthData}
              xAccessor={(d: any) => d.depth}
              yAccessor={(d: any) => d.tick}
              colorAccessor={() => theme.colors.barFill}
            />
            <Tooltip
              showVerticalCrosshair
              snapTooltipToDatumX
              renderTooltip={({ tooltipData, colorScale }) => (
                <>
                  <div style={{ color: colorScale('price') }}>{'price'}</div>
                  <br />
                  <div>hello</div>
                </>
              )}
            />
            <style>{`
              .visx-bar {
                stroke: ${theme.colors.barFill};
                stroke-width: 1px;
              }
            `}</style>
          </XYChart>
        );
      }}
    </ParentSize>
  );
}
