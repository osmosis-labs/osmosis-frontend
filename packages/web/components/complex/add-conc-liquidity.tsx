import {FunctionComponent, ReactNode, useState} from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PricePretty, CoinPretty } from "@keplr-wallet/unit";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { useWindowSize } from "../../hooks";
// import { MenuToggle } from "../../components/control";
// import { Token } from "../../components/assets";
import { InputBox } from "../../components/input";
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
  Annotation,
  AnnotationLineSubject,
  AnnotationConnector, AnnotationCircleSubject,
} from '@visx/xychart';

import {ParentSize} from "@visx/responsive";
import {curveNatural} from "@visx/curve";
import {theme} from "../../tailwind.config";
import {scaleLinear} from "@visx/scale";
import {debounce} from "debounce";

const data1 = makeData();

const accessors = {
  xAccessor: (d: any) => {
    return d?.time;
  },
  yAccessor: (d: any) => {
    return d?.price;
  },
};

function makeData(lastPrice = 1) {
  let lp = lastPrice;
  let date = Date.now();
  return Array(168)
    .fill(null)
    .map((_, i) => {
      const diffPer = !i ? 0 : (Math.random() - .5) / (.5 / .05);
      const newLp = lp + lp * diffPer;
      lp = newLp;
      return {
        time: date - i * 3600000,
        price: newLp,
      };
    })
    .reverse();
}

function getRangeFromData(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const last = data[data.length - 1];
  const diff = Math.max(
    Math.max(Math.abs(last - max), Math.abs(last - min)),
    last * 0.25,
  );

  return {
    min: Math.max(0, last - diff),
    max: last + diff,
    last,
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

const yRange = getRangeFromData(data1.map(accessors.yAccessor));
const depthData = getDepthFromRange(yRange.min, yRange.max);

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
    const [inputMin, setInputMin] = useState(yRange.last * 0.85);
    const [inputMax, setInputMax] = useState(yRange.last * 1.15);
    const [min, setMin] = useState(yRange.last * 0.85);
    const [max, setMax] = useState(yRange.last * 1.15);

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
            <div className="flex flex-row flex-1 flex-shrink-1 w-0 bg-osmoverse-700 h-[20.1875rem]">
              <BarChart
                min={min}
                max={max}
                onMoveMax={debounce(setInputMax, 100)}
                onMoveMin={debounce(setInputMin, 100)}
                onSubmitMin={val => {
                  setMin(val);
                  setInputMin(val);
                }}
                onSubmitMax={val => {
                  setMax(val);
                  setInputMax(val);
                }}
              />
              <div>
                <InputBox
                  type="number"
                  currentValue={inputMin}
                  onInput={val => {
                    setMin(val);
                    setInputMin(val);
                  }}
                />
                <InputBox
                  currentValue={inputMax}
                  onInput={val => {
                    setMax(val);
                    setInputMax(val);
                  }}
                />
              </div>
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
    <ParentSize
      className="flex-1 flex-shrink-1 overflow-hidden"
    >
      {({height, width}) => {
        return (
          <XYChart
            key="line-chart"
            margin={{ top: 0, right: 0, bottom: 36, left: 50 }}
            height={height}
            width={width}
            xScale={{
              type: 'utc',
              paddingInner: 0.5,
            }}
            yScale={{
              type: 'linear',
              domain: [yRange.min, yRange.max],
              zero: false,
            }}
            theme={buildChartTheme({
              backgroundColor: "transparent",
              colors: ["white"],
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
              dataKey="price"
              data={data1}
              curve={curveNatural}
              {...accessors}
              stroke={theme.colors.wosmongton['200']}
            />
            <Tooltip
              // showVerticalCrosshair
              // showHorizontalCrosshair
              snapTooltipToDatumX
              snapTooltipToDatumY
              detectBounds
              showDatumGlyph
              glyphStyle={{
                strokeWidth: 0,
                fill: theme.colors.wosmongton['200'],
              }}
              horizontalCrosshairStyle={{
                strokeWidth: 1,
                stroke: '#ffffff',
              }}
              verticalCrosshairStyle={{
                strokeWidth: 1,
                stroke: '#ffffff',
              }}
              renderTooltip={({ tooltipData, colorScale }) => {
                return (
                  <div className={`bg-osmoverse-800 p-2 text-xs leading-4`}>
                    <div className="text-white-full">
                      {tooltipData.nearestDatum.datum.price.toFixed(4)}
                    </div>
                    <div className="text-osmoverse-300">
                      {`High: ${Math.max(...data1.map(accessors.yAccessor)).toFixed(4)}`}
                    </div>
                    <div className="text-osmoverse-300">
                      {`Low: ${Math.min(...data1.map(accessors.yAccessor)).toFixed(4)}`}
                    </div>
                  </div>
                )
              }}
            />
          </XYChart>
        );
      }}
    </ParentSize>
  );
}

function BarChart(props: {
  min: number;
  max: number;
  onMoveMax: (value: number) => void;
  onSubmitMax: (value: number) => void;
  onMoveMin: (value: number) => void;
  onSubmitMin: (value: number) => void;
}) {
  const xMax = Math.max(...depthData.map(d => d.depth)) * 1.2;

  return (
    <ParentSize className="flex-1 flex-shrink-1 overflow-hidden">
      {({height, width}) => {
        const yScale = scaleLinear({
          range: [64, height - 36],
          domain: [yRange.max, yRange.min],
          zero: false,
        });

        return (
          <XYChart
            key="bar-chart"
            captureEvents={false}
            margin={{ top: 64, right: 36, bottom: 36, left: 0 }}
            height={height}
            width={width}
            xScale={{
              type: 'linear',
              domain: [
                0,
                xMax,
              ],
            }}
            yScale={{
              type: 'linear',
              // range: [64, height - 36],
              domain: [yRange.min, yRange.max],
              zero: false,
            }}
            theme={buildChartTheme({
              backgroundColor: "transparent",
              colors: ["white"],
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
            horizontal={true}
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
              dataKey="depth"
              data={depthData}
              xAccessor={(d: any) => d?.depth}
              yAccessor={(d: any) => d?.tick}
              colorAccessor={() => theme.colors.barFill}
            />
            <Annotation
              dataKey="depth"
              xAccessor={(d: any) => d.depth}
              yAccessor={(d: any) => d.tick}
              datum={{tick: yRange.last, depth: xMax}}
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
            <DragContainer
              defaultValue={props.max || yRange.last * 1.15}
              length={xMax}
              scale={yScale}
              stroke={theme.colors.wosmongton['500']}
              onMove={props.onMoveMax}
              onSubmit={props.onSubmitMax}
            />
            <DragContainer
              defaultValue={props.min || yRange.last * .85}
              length={xMax}
              scale={yScale}
              stroke={theme.colors.bullish["500"]}
              onMove={props.onMoveMin}
              onSubmit={props.onSubmitMin}
            />
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
}

function DragContainer(props: {
  defaultValue?: number,
  length?: number,
  scale: any,
  onMove?: (value: number) => void;
  onSubmit?: (value: number) => void;
  stroke: string,
}) {
  return (
    <Annotation
      dataKey="depth"
      xAccessor={(d: any) => d?.depth}
      yAccessor={(d: any) => d?.tick}
      // datum={{tick: yRange.last * .85, depth: xMax}}
      datum={{tick: props.defaultValue, depth: props.length}}
      canEditSubject
      canEditLabel={false}
      onDragMove={({ event, ...nextPos}) => {
        if (props.onMove) props.onMove(props.scale.invert(nextPos.y));
      }}
      onDragEnd={({ event, ...nextPos}) => {
        if (props.onSubmit) props.onSubmit(props.scale.invert(nextPos.y));
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
  )
}