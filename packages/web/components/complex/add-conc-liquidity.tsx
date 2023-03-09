import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import {
  ObservableAddLiquidityConfig,
  ObservablePoolDetail,
  ObservableQueryPool,
  ObservableSuperfluidPoolDetail,
} from "@osmosis-labs/stores";
import { curveNatural } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedBarSeries,
  AnimatedGrid,
  AnimatedLineSeries,
  Annotation,
  AnnotationCircleSubject,
  AnnotationConnector,
  AnnotationLineSubject,
  buildChartTheme,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import classNames from "classnames";
import { debounce } from "debounce";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "../../stores";
import { theme } from "../../tailwind.config";
import { PoolAssetsIcon } from "../assets";
import { Button } from "../buttons";
import { InputBox } from "../input";
import { CustomClasses } from "../types";

enum AddConcLiquidityModalView {
  Overview,
  AddConcLiq,
  AddFullRange,
}

const accessors = {
  xAccessor: (d: any) => {
    return d?.time;
  },
  yAccessor: (d: any) => {
    return d?.price;
  },
};

function getRangeFromData(data: number[]) {
  if (!data.length) {
    return {
      min: 0,
      max: 0,
      last: 0,
    };
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const last = data[data.length - 1];
  const diff = Math.max(
    Math.max(Math.abs(last - max), Math.abs(last - min)),
    last * 0.25
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

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(
  ({ className, addLiquidityConfig, actionButton, getFiatValue }) => {
    const router = useRouter();
    const { id: poolId } = router.query as { id: string };
    const [view, setView] = useState<AddConcLiquidityModalView>(
      AddConcLiquidityModalView.Overview
    );
    const { derivedDataStore } = useStore();

    // initialize pool data stores once root pool store is loaded
    const { poolDetail, superfluidPoolDetail } =
      typeof poolId === "string"
        ? derivedDataStore.getForPool(poolId as string)
        : {
            poolDetail: undefined,
            superfluidPoolDetail: undefined,
          };
    const pool = poolDetail?.pool;

    // user analytics
    const { poolName } = useMemo(
      () => ({
        poolName: pool?.poolAssets
          .map((poolAsset) => poolAsset.amount.denom)
          .join(" / "),
        poolWeight: pool?.weightedPoolInfo?.assets
          .map((poolAsset) => poolAsset.weightFraction.toString())
          .join(" / "),
      }),
      [pool?.poolAssets, pool?.weightedPoolInfo?.assets]
    );

    return (
      <div className={classNames("flex flex-col gap-8", className)}>
        {(() => {
          switch (view) {
            case AddConcLiquidityModalView.Overview:
              return (
                <Overview
                  pool={pool}
                  poolName={poolName}
                  poolDetail={poolDetail}
                  superfluidPoolDetail={superfluidPoolDetail}
                  setView={setView}
                />
              );
            case AddConcLiquidityModalView.AddConcLiq:
              return (
                <AddConcLiqView
                  getFiatValue={getFiatValue}
                  pool={pool}
                  addLiquidityConfig={addLiquidityConfig}
                  actionButton={actionButton}
                  setView={setView}
                />
              );
            case AddConcLiquidityModalView.AddFullRange:
              return null;
          }
        })()}
      </div>
    );
  }
);

const Overview: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    poolName?: string;
    poolDetail?: ObservablePoolDetail;
    superfluidPoolDetail?: ObservableSuperfluidPoolDetail;
    setView: (view: AddConcLiquidityModalView) => void;
  } & CustomClasses
> = observer(
  ({ setView, pool, poolName, superfluidPoolDetail, poolDetail }) => {
    const { priceStore, queriesExternalStore } = useStore();
    const router = useRouter();
    const { id: poolId } = router.query as { id: string };
    const t = useTranslation();
    const [selected, selectView] = useState<AddConcLiquidityModalView>(
      AddConcLiquidityModalView.AddFullRange
    );
    const queryGammPoolFeeMetrics =
      queriesExternalStore.queryGammPoolFeeMetrics;

    return (
      <>
        <div className="align-center relative flex flex-row">
          <div className="absolute left-0 flex h-full items-center text-sm" />
          <div className="flex-1 text-center text-lg">
            {t("addLiquidity.title")}
          </div>
          <div className="absolute right-0 flex h-full items-center text-xs font-subtitle2 text-osmoverse-200" />
        </div>
        <div className="flex flex-row rounded-[28px] bg-osmoverse-900/[.3] px-8 py-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-row flex-nowrap items-center gap-2">
              {pool && (
                <PoolAssetsIcon
                  assets={pool.poolAssets.map(
                    (asset: { amount: CoinPretty }) => ({
                      coinDenom: asset.amount.denom,
                      coinImageUrl: asset.amount.currency.coinImageUrl,
                    })
                  )}
                  size="sm"
                />
              )}
              <h5 className="max-w-xs truncate">{poolName}</h5>
            </div>
            {superfluidPoolDetail?.isSuperfluid && (
              <span className="body2 text-superfluid-gradient">
                {t("pool.superfluidEnabled")}
              </span>
            )}
            {pool?.type === "stable" && (
              <div className="body2 text-gradient-positive flex items-center gap-1.5">
                <Image
                  alt=""
                  src="/icons/stableswap-pool.svg"
                  height={24}
                  width={24}
                />
                <span>{t("pool.stableswapEnabled")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-10">
            <div className="space-y-2">
              <span className="body2 gap-2 text-osmoverse-400">
                {t("pool.24hrTradingVolume")}
              </span>
              <h5 className="text-osmoverse-100">
                {queryGammPoolFeeMetrics
                  .getPoolFeesMetrics(poolId, priceStore)
                  .volume24h.toString()}
              </h5>
            </div>
            <div className="space-y-2">
              <span className="body2 gap-2 text-osmoverse-400">
                {t("pool.liquidity")}
              </span>
              <h5 className="text-osmoverse-100">
                {poolDetail?.totalValueLocked.toString()}
              </h5>
            </div>
            <div className="space-y-2">
              <span className="body2 gap-2 text-osmoverse-400">
                {t("pool.swapFee")}
              </span>
              <h5 className="text-osmoverse-100">{pool?.swapFee.toString()}</h5>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row justify-center gap-8">
            <StrategySelector
              title="Full range"
              description="If you don’t plan on rebalancing your positions frequently, this is the best way to add liquidity."
              selected={selected === AddConcLiquidityModalView.AddFullRange}
              onClick={() => selectView(AddConcLiquidityModalView.AddFullRange)}
              imgSrc="/images/fullrange_mock_range.png"
            />
            <StrategySelector
              title="Concentrated"
              description="If you don’t plan on rebalancing your positions frequently, this is the best way to add liquidity."
              selected={selected === AddConcLiquidityModalView.AddConcLiq}
              onClick={() => selectView(AddConcLiquidityModalView.AddConcLiq)}
              imgSrc="/images/conliq_mock_range.png"
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <Button className="w-[25rem]" onClick={() => setView(selected)}>
            Next
          </Button>
        </div>
      </>
    );
  }
);

function StrategySelector(props: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  imgSrc: string;
}) {
  const { selected, onClick, title, description, imgSrc } = props;
  return (
    <div
      className={classNames(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[20px] border-2 border-osmoverse-700 py-6 px-8 hover:border-osmoverse-100 hover:bg-osmoverse-700",
        {
          "border-osmoverse-100 bg-osmoverse-700": selected,
        }
      )}
      onClick={onClick}
    >
      <div className="mb-16 text-h6 font-h6">{title}</div>
      <Image alt="" src={imgSrc} width={325} height={101} />
      <div className="text-center text-body2 font-body2 text-osmoverse-200">
        {description}
      </div>
    </div>
  );
}

const AddConcLiqView: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    addLiquidityConfig: ObservableAddLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
    setView: (view: AddConcLiquidityModalView) => void;
  } & CustomClasses
> = observer(
  ({
    // className,
    // addLiquidityConfig,
    actionButton,
    getFiatValue,
    setView,
    pool,
  }) => {
    // const { chainStore } = useStore();
    // const { isMobile } = useWindowSize();
    const t = useTranslation();
    // const {
    //   priceStore,
    // } = useStore();
    const [data, setData] = useState<{ price: number; time: number }[]>([]);
    const [baseDeposit, setBaseDeposit] = useState(0);
    const [quoteDeposit, setQuoteDeposit] = useState(0);

    const yRange = getRangeFromData(data.map(accessors.yAccessor));

    const [inputMin, setInputMin] = useState("0");
    const [inputMax, setInputMax] = useState("0");
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const baseDenom = pool?.poolAssets[0].amount.denom;
    const quoteDenom = pool?.poolAssets[1].amount.denom;
    const [range, setRange] = useState<"7d" | "1mo" | "1y">("7d");
    const router = useRouter();
    const { id: poolId } = router.query as { id: string };
    const [zoom, setZoom] = useState(1);

    const updateMin = useCallback(
      (val: string | number, shouldUpdateRange = false) => {
        const out = Math.min(Math.max(Number(val), 0), Number(inputMax));
        if (shouldUpdateRange) setMin(out);
        if (Number(val) !== out) {
          setInputMin("" + out);
        } else {
          setInputMin("" + val);
        }
      },
      [inputMax]
    );

    const updateMax = useCallback(
      (val: string | number, shouldUpdateRange = false) => {
        const out = Math.max(Number(val), Number(inputMin));
        if (shouldUpdateRange) setMax(out);
        if (Number(val) !== out) {
          setInputMax("" + out);
        } else {
          setInputMax("" + val);
        }
      },
      [inputMin]
    );

    const updateData = useCallback(
      (data: { price: number; time: number }[]) => {
        const last = data[data.length - 1];
        setData(data);
        setInputMin("" + last.price * 0.9);
        setMin(last.price * 0.9);
        setInputMax("" + last.price * 1.15);
        setMax(last.price * 1.15);
      },
      []
    );

    useEffect(() => {
      (async () => {
        const resp = await fetch(
          `https://api-osmosis.imperator.co/pairs/v1/historical/${poolId}/chart?asset_in=${baseDenom}&asset_out=${quoteDenom}&range=${range}&asset_type=symbol`
        );
        const json = await resp.json();
        const data = json.map(
          ({ time, close }: { time: number; close: number }) => ({
            time: time * 1000,
            price: close,
          })
        );
        updateData(data);
      })();
    }, [range, baseDenom, quoteDenom, updateData, poolId]);

    return (
      <>
        <div className="align-center relative flex flex-row">
          <div
            className="absolute left-0 flex h-full cursor-pointer items-center text-sm"
            onClick={() => setView(AddConcLiquidityModalView.Overview)}
          >
            {"<- Back"}
          </div>
          <div className="flex-1 text-center text-lg">
            {t("addLiquidity.title")}
          </div>
          <div className="absolute right-0 flex h-full items-center text-xs font-subtitle2 text-osmoverse-200">
            {`Prices shown in ${baseDenom} per ${quoteDenom}`}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="px-2 py-1 text-sm">Price Range</div>
          <div className="flex flex-row">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col bg-osmoverse-700">
              <div className="flex flex-row">
                <div className="flex flex-1 flex-row pt-4 pl-4">
                  <h4 className="row-span-2 pr-1 font-caption">
                    {!!data.length && data[data.length - 1].price.toFixed(2)}
                  </h4>
                  <div className="flex flex-col justify-center font-caption">
                    <div className="text-caption text-osmoverse-300">
                      current price
                    </div>
                    <div className="text-caption text-osmoverse-300">{`${baseDenom} per ${quoteDenom}`}</div>
                  </div>
                </div>
                <div className="flex flex-1 flex-row justify-end gap-1 pt-2 pr-2">
                  <RangeSelector
                    label="7 day"
                    onClick={() => setRange("7d")}
                    selected={range === "7d"}
                  />
                  <RangeSelector
                    label="30 days"
                    onClick={() => setRange("1mo")}
                    selected={range === "1mo"}
                  />
                  <RangeSelector
                    label="1 year"
                    onClick={() => setRange("1y")}
                    selected={range === "1y"}
                  />
                </div>
              </div>
              <LineChart min={min} max={max} data={data} zoom={zoom} />
            </div>
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-row bg-osmoverse-700">
              <div className="flex flex-1 flex-col">
                <div className="mt-6 mr-6 flex h-6 flex-row justify-end gap-1">
                  <SelectorWrapper selected={false} onClick={() => setZoom(1)}>
                    <Image
                      alt="refresh"
                      src="/icons/refresh-ccw.svg"
                      width={16}
                      height={16}
                    />
                  </SelectorWrapper>
                  <SelectorWrapper
                    selected={false}
                    onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                  >
                    <Image
                      alt="zoom in"
                      src="/icons/zoom-in.svg"
                      width={16}
                      height={16}
                    />
                  </SelectorWrapper>
                  <SelectorWrapper
                    selected={false}
                    onClick={() => setZoom(zoom + 0.2)}
                  >
                    <Image
                      alt="zoom out"
                      src="/icons/zoom-out.svg"
                      width={16}
                      height={16}
                    />
                  </SelectorWrapper>
                </div>
                <BarChart
                  min={min}
                  max={max}
                  onMoveMax={debounce((val) => updateMax(val), 100)}
                  onMoveMin={debounce((val) => updateMin(val), 100)}
                  onSubmitMin={(val) => updateMin(val, true)}
                  onSubmitMax={(val) => updateMax(val, true)}
                  data={data}
                  zoom={zoom}
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-4 pr-8">
                <PriceInputBox
                  currentValue={inputMax}
                  label="high"
                  onChange={(val) => updateMax(val, true)}
                />
                <PriceInputBox
                  currentValue={inputMin}
                  label="low"
                  onChange={(val) => updateMin(val, true)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="flex max-w-[15.8125rem] flex-col px-4">
            <div className="text-subtitle1">Select volatility range</div>
            <div className="text-body2 text-osmoverse-200">
              Tight ranges earn more fees per dollar, but earn no fees when
              price is out of range.
            </div>
          </div>
          <div className="flex flex-1 flex-row justify-end gap-4">
            <PresetVolatilityCard
              src="/images/small-vial.svg"
              upper={15}
              lower={-10}
              selected={max === yRange.last * 1.15 && min === yRange.last * 0.9}
              onClick={() => {
                setMax(yRange.last * 1.15);
                setInputMax("" + yRange.last * 1.15);
                setMin(yRange.last * 0.9);
                setInputMin("" + yRange.last * 0.9);
              }}
            />
            <PresetVolatilityCard
              src="/images/medium-vial.svg"
              upper={25}
              lower={-25}
              selected={
                max === yRange.last * 1.25 && min === yRange.last * 0.75
              }
              onClick={() => {
                setMax(yRange.last * 1.25);
                setInputMax("" + yRange.last * 1.25);
                setMin(yRange.last * 0.75);
                setInputMin("" + yRange.last * 0.75);
              }}
            />
            <PresetVolatilityCard
              src="/images/large-vial.svg"
              upper={50}
              lower={-50}
              selected={max === yRange.last * 1.5 && min === yRange.last * 0.5}
              onClick={() => {
                setMax(yRange.last * 1.5);
                setInputMax("" + yRange.last * 1.5);
                setMin(yRange.last * 0.5);
                setInputMin("" + yRange.last * 0.5);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="px-2 py-1 text-sm">Amount to deposit</div>
          <div className="flex flex-row justify-center rounded-[20px] bg-osmoverse-700 p-[1.25rem]">
            <DepositAmountGroup
              getFiatValue={getFiatValue}
              coin={pool?.poolAssets[0].amount}
              onInput={setBaseDeposit}
              currentValue={baseDeposit}
            />
            <div className="mx-8 my-4">
              <Image
                alt=""
                className="m-4"
                src="/icons/link-2.svg"
                width={35}
                height={35}
              />
            </div>
            <DepositAmountGroup
              getFiatValue={getFiatValue}
              coin={pool?.poolAssets[1].amount}
              onInput={setQuoteDeposit}
              currentValue={quoteDeposit}
            />
          </div>
        </div>
        {actionButton}
      </>
    );
  }
);

function SelectorWrapper(props: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={classNames(
        "flex h-6 cursor-pointer flex-row items-center justify-center rounded-lg bg-osmoverse-800 px-2 text-xs hover:bg-osmoverse-900",
        {
          "!bg-osmoverse-900": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

function RangeSelector(props: {
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <SelectorWrapper selected={props.selected} onClick={props.onClick}>
      {props.label}
    </SelectorWrapper>
  );
}

const DepositAmountGroup: FunctionComponent<{
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  coin?: CoinPretty;
  onInput: (amount: number) => void;
  currentValue: number;
}> = observer(
  ({
    coin,
    onInput,
    currentValue,
    // getFiatValue,
  }) => {
    const { priceStore, assetsStore } = useStore();

    const { nativeBalances, ibcBalances } = assetsStore;

    const fiatPer = coin?.currency.coinGeckoId
      ? priceStore.getPrice(coin.currency.coinGeckoId, undefined)
      : 0;

    const [walletBalance] = nativeBalances
      .concat(ibcBalances)
      .filter((balance) => balance.balance.denom === coin?.denom);

    return (
      <div className="flex-0 flex flex-shrink-0 flex-row items-center">
        <div className="flex flex-row items-center">
          {coin?.currency.coinImageUrl && (
            <Image
              alt=""
              src={coin?.currency.coinImageUrl}
              height={58}
              width={58}
            />
          )}
          <div className="ml-[.75rem] mr-[2.75rem] flex flex-col">
            <h6>{coin?.denom.toUpperCase()}</h6>
            <div className="text-osmoverse-200">50%</div>
          </div>
          <div>
            <div className="text-right text-caption text-wosmongton-300">
              {walletBalance?.balance.toString()}
            </div>
            <div className="flex h-16 w-[158px] flex-col items-end justify-center rounded-[12px] bg-osmoverse-800">
              <InputBox
                className="border-0 bg-transparent text-h5"
                inputClassName="!leading-4"
                type="number"
                currentValue={"" + currentValue}
                onInput={(value) => onInput(Number(value))}
                rightEntry
              />
              <div className="pr-3 text-caption text-osmoverse-400">
                {fiatPer && `~$${(fiatPer * currentValue).toFixed(2)}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function PresetVolatilityCard(props: {
  src: string;
  width?: number;
  height?: number;
  upper: number;
  lower: number;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={classNames(
        "flex h-[5.625rem] w-[10.625rem] cursor-pointer flex-row",
        "overflow-hidden rounded-[1.125rem] border-[1.5px] bg-osmoverse-700",
        "border-transparent hover:border-wosmongton-200",
        {
          "border-osmoverse-200": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      <div className="flex w-full flex-row items-end justify-end">
        <div className="flex-shrink-1 flex h-full flex-1 flex-row items-end items-center justify-center">
          <Image
            alt=""
            className="flex-0 ml-2"
            src={props.src}
            width={props.width || 64}
            height={props.height || 64}
          />
        </div>
        <div className="flex h-full flex-1 flex-col justify-center">
          <div className="flex flex-row items-center">
            <Image
              alt=""
              src="/icons/green-up-tick.svg"
              width={16}
              height={16}
            />
            <div className="flex-1 pr-4 text-right text-subtitle1 text-osmoverse-200">
              +{props.upper}%
            </div>
          </div>
          <div className="flex flex-row items-center">
            <Image
              alt=""
              src="/icons/red-down-tick.svg"
              width={16}
              height={16}
            />
            <div className="flex-1 pr-4 text-right text-subtitle1 text-osmoverse-200">
              {props.lower}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceInputBox(props: {
  label: string;
  currentValue: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex max-w-[9.75rem] flex-col items-end rounded-xl bg-osmoverse-800 px-2">
      <span className="px-2 pt-2 text-caption text-osmoverse-400">
        {props.label}
      </span>
      <InputBox
        className="border-0 bg-transparent text-subtitle1 leading-tight"
        type="number"
        rightEntry
        currentValue={props.currentValue}
        onInput={(val) => props.onChange(val)}
      />
    </div>
  );
}

function calculateRange(
  min: number,
  max: number,
  inputMin: number,
  inputMax: number,
  last: number
) {
  let outMin = min;
  let outMax = max;

  const delta =
    Math.max(last - inputMin, inputMax - last, last - min, max - last) * 1.5;

  if (inputMin < min * 1.2 || inputMax > max * 0.8) {
    outMin = last - delta;
    outMax = last + delta;
  }

  return [Math.max(0, Math.min(outMin, outMax)), Math.max(outMax, outMin)];
}

function LineChart(props: {
  min: number;
  max: number;
  zoom: number;
  data: { price: number; time: number }[];
}) {
  const yRange = getRangeFromData(props.data.map(accessors.yAccessor));

  if (props.zoom > 1) {
    yRange.min = yRange.min / props.zoom;
    yRange.max = yRange.max * props.zoom;
  } else if (props.zoom < 1) {
    yRange.min = yRange.min * props.zoom;
    yRange.max = yRange.max * props.zoom;
  }

  const domain = calculateRange(
    yRange.min,
    yRange.max,
    props.min,
    props.max,
    yRange.last
  );

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
              domain: domain,
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
              data={props.data}
              curve={curveNatural}
              {...accessors}
              stroke={theme.colors.wosmongton["200"]}
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
                return (
                  <div className={`bg-osmoverse-800 p-2 text-xs leading-4`}>
                    <div className="text-white-full">
                      {tooltipData?.nearestDatum?.datum?.price.toFixed(4)}
                    </div>
                    <div className="text-osmoverse-300">
                      {`High: ${Math.max(
                        ...props.data.map(accessors.yAccessor)
                      ).toFixed(4)}`}
                    </div>
                    <div className="text-osmoverse-300">
                      {`Low: ${Math.min(
                        ...props.data.map(accessors.yAccessor)
                      ).toFixed(4)}`}
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
}

function BarChart(props: {
  min: number;
  max: number;
  zoom: number;
  onMoveMax: (value: number) => void;
  onMoveMin: (value: number) => void;
  onSubmitMax: (value: number) => void;
  onSubmitMin: (value: number) => void;
  data: { price: number; time: number }[];
}) {
  const yRange = getRangeFromData(props.data.map(accessors.yAccessor));
  const depthData = getDepthFromRange(yRange.min, yRange.max);
  const xMax = Math.max(...depthData.map((d) => d.depth)) * 1.2;

  if (props.zoom > 1) {
    yRange.min = yRange.min / props.zoom;
    yRange.max = yRange.max * props.zoom;
  } else if (props.zoom < 1) {
    yRange.min = yRange.min * props.zoom;
    yRange.max = yRange.max * props.zoom;
  }

  const domain = calculateRange(
    yRange.min,
    yRange.max,
    props.min,
    props.max,
    yRange.last
  );

  return (
    <ParentSize className="flex-shrink-1 flex-1 overflow-hidden">
      {({ height, width }) => {
        const yScale = scaleLinear({
          range: [58 - 48, height - 36],
          domain: domain.slice().reverse(),
          zero: false,
        });

        return (
          <XYChart
            key="bar-chart"
            captureEvents={false}
            margin={{ top: 58 - 48, right: 36, bottom: 36, left: 0 }}
            height={height}
            width={width}
            xScale={{
              type: "linear",
              domain: [0, xMax],
            }}
            yScale={{
              type: "linear",
              domain: domain,
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
            horizontal={true}
          >
            {/* Uncomment when testing alignment */}
            {/*<AnimatedAxis*/}
            {/*  orientation="right"*/}
            {/*  numTicks={5}*/}
            {/*  strokeWidth={0}*/}
            {/*/>*/}
            <AnimatedGrid columns={false} rows={false} numTicks={5} />
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
              datum={{ tick: yRange.last, depth: xMax }}
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
              defaultValue={props.max}
              length={xMax}
              scale={yScale}
              stroke={theme.colors.wosmongton["500"]}
              onMove={props.onMoveMax}
              onSubmit={props.onSubmitMax}
            />
            <DragContainer
              defaultValue={props.min}
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
  defaultValue?: number;
  length?: number;
  scale: any;
  onMove?: (value: number) => void;
  onSubmit?: (value: number) => void;
  stroke: string;
}) {
  return (
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
}
