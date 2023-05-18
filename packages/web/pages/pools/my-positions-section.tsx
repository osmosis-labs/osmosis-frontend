import { Dec, Int } from "@keplr-wallet/unit";
import { tickToSqrtPrice } from "@osmosis-labs/math";
import { ObservableAddConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { useAddConcentratedLiquidityConfig } from "~/hooks";
import { useStore } from "~/stores";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

type Asset = {
  amount: string;
  denom: string;
};
type PositionWithAssets = {
  asset0: Asset;
  asset1: Asset;
  position: {
    address: string;
    join_time: string;
    liquidity: string;
    lower_tick: string;
    pool_id: string;
    position_id: string;
    upper_tick: string;
  };
};
const MyPositionsSection = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const [mergedPositions, setMergedPositions] = useState<{
    [key: string]: PositionWithAssets[];
  }>({});

  useEffect(() => {
    (async () => {
      const resp = await fetch(
        `http://localhost:1317/osmosis/concentratedliquidity/v1beta1/positions/${account.bech32Address}`
      );
      const json: { positions: PositionWithAssets[] } = await resp.json();

      const mergedPositions: { [key: string]: PositionWithAssets[] } = {};

      json.positions?.forEach(({ asset0, asset1, position }) => {
        const { lower_tick, upper_tick, pool_id } = position;
        const key = `${pool_id}_${lower_tick}_${upper_tick}`;
        mergedPositions[key] = mergedPositions[key] || [];
        mergedPositions[key].push({ position, asset0, asset1 });
      });

      setMergedPositions(mergedPositions);
    })();
  }, [account.bech32Address]);

  if (!Object.keys(mergedPositions).length) return null;

  return (
    <div className="mx-auto pb-[3.75rem]">
      {/* TODO: add translation */}
      <h6 className="">Your Positions</h6>
      <div className="flex flex-col gap-3">
        {Object.keys(mergedPositions).map((key) => {
          const positions = mergedPositions[key];
          return <MyPositionCard key={key} positions={positions} />;
        })}
      </div>
    </div>
  );
});

export default MyPositionsSection;

const MyPositionCard: FunctionComponent<{
  positions: PositionWithAssets[];
}> = observer(({ positions }) => {
  const { derivedDataStore, chainStore, queriesStore } = useStore();
  const [collapsed, setCollapsed] = useState(true);

  const poolId = positions[0].position.pool_id;
  const pool = derivedDataStore.poolDetails.get(poolId);
  const { chainId } = chainStore.osmosis;
  const _queryPool = pool.pool;

  const { config } = useAddConcentratedLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const { range, setMinRange, setMaxRange, setHoverPrice, lastChartData } =
    config;

  const rangeMin = Number(range[0].toString());
  const rangeMax = Number(range[1].toString());

  const { lower_tick, upper_tick } = positions[0].position;
  const lowerSqrtPrice = tickToSqrtPrice(new Int(lower_tick));
  const upperSqrtPrice = tickToSqrtPrice(new Int(upper_tick));
  const lowerPrice = lowerSqrtPrice.mul(lowerSqrtPrice);
  const upperPrice = upperSqrtPrice.mul(upperSqrtPrice);

  useEffect(() => {
    setMinRange(lowerPrice);
    setMaxRange(upperPrice);
  }, [lowerPrice.toString(), upperPrice.toString()]);

  if (!_queryPool) return null;

  return (
    <div
      className={classNames(
        "flex flex-col gap-8 rounded-[20px] bg-osmoverse-800 p-8"
      )}
    >
      <div
        className="flex cursor-pointer flex-row items-center gap-[52px]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <PoolAssetsIcon
            assets={_queryPool.poolAssets.map((poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.currency.coinDenom,
            }))}
          />
        </div>
        <div className="flex flex-grow flex-col gap-[10px]">
          <div className="flex flex-row gap-[14px]">
            <PoolAssetsName
              size="md"
              assetDenoms={_queryPool.poolAssets.map(
                (asset) => asset.amount.currency.coinDenom
              )}
            />
            {/* TODO: use actual fee */}
            <span className="text-subtitle1 text-osmoverse-100">0.5% Fee</span>
          </div>
          <MyPositionStatus status={PositionStatus.InRange} />
        </div>
        {/* TODO: use actual ROI */}
        {/* TODO: use translation */}
        <PositionDataGroup label="ROI" value="0.18%" />
        {/* TODO: use translation */}
        <PositionDataGroup
          label="Selected Range"
          value={`${lowerPrice.toString()} - ${upperPrice.toString()}`}
        />
        {/* TODO: use translation */}
        <PositionDataGroup label="My Liquidity" value="$2,350" />
        {/* TODO: use translation */}
        <PositionDataGroup label="Incentives" value="25% APR" />
      </div>
      {!collapsed && (
        <>
          <div className="flex flex-row gap-1">
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
              <PriceChartHeader addLiquidityConfig={config} />
              <TokenPairHistoricalChart
                data={config.historicalChartData}
                annotations={
                  config.fullRange
                    ? [
                        new Dec(config.yRange[0] * 1.05),
                        new Dec(config.yRange[1] * 0.95),
                      ]
                    : config.range
                }
                domain={config.yRange}
                onPointerHover={setHoverPrice}
                onPointerOut={
                  lastChartData
                    ? () => setHoverPrice(lastChartData.close)
                    : undefined
                }
              />
            </div>
            <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-row rounded-r-2xl bg-osmoverse-700">
              <div className="mt-[84px] flex flex-1 flex-col">
                <ConcentratedLiquidityDepthChart
                  min={rangeMin}
                  max={rangeMax}
                  yRange={config.yRange}
                  xRange={config.xRange}
                  data={config.depthChartData}
                  annotationDatum={{
                    price: config.lastChartData?.close || 0,
                    depth: config.xRange[1],
                  }}
                  rangeAnnotation={[
                    {
                      price: Number(lowerPrice.toString()),
                      depth: config.xRange[1],
                    },
                    {
                      price: Number(upperPrice.toString()),
                      depth: config.xRange[1],
                    },
                  ]}
                  offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                  horizontal
                  fullRange={config.fullRange}
                />
              </div>
              <div className="mb-8 flex flex-col pr-8">
                <div className="mt-7 mr-6 flex h-6 flex-row gap-1">
                  <SelectorWrapper
                    alt="refresh"
                    src="/icons/refresh-ccw.svg"
                    selected={false}
                    onClick={() => config.setZoom(1)}
                  />
                  <SelectorWrapper
                    alt="zoom in"
                    src="/icons/zoom-in.svg"
                    selected={false}
                    onClick={config.zoomIn}
                  />
                  <SelectorWrapper
                    alt="zoom out"
                    src="/icons/zoom-out.svg"
                    selected={false}
                    onClick={config.zoomOut}
                  />
                </div>
                <div className="flex h-full flex-col justify-between py-4">
                  {/* TODO: use translation */}
                  <PriceInputBox
                    currentValue={
                      config.fullRange
                        ? ""
                        : upperPrice.toString(config.priceDecimal)
                    }
                    label="Max price"
                    infinity={config.fullRange}
                  />
                  {/* TODO: use translation */}
                  <PriceInputBox
                    currentValue={
                      config.fullRange
                        ? "0"
                        : lowerPrice.toString(config.priceDecimal)
                    }
                    label="Min price"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div>
                <div>Current Assets</div>
                <div className="flex flex-row gap-1">
                  <img
                    className="h-[1.5rem] w-[1.5rem]"
                    src={_queryPool.poolAssets[0].amount.currency.coinImageUrl}
                  />
                  <span>{positions[0]?.asset0.amount}</span>
                  <span>{positions[0]?.asset0.denom}</span>
                  <img
                    className="h-[1.5rem] w-[1.5rem]"
                    src={_queryPool.poolAssets[1].amount.currency.coinImageUrl}
                  />
                  <span>{positions[0]?.asset1.amount}</span>
                  <span>{positions[0]?.asset1.denom}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col"></div>
          </div>
        </>
      )}
    </div>
  );
});

function PositionDataGroup(props: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="text-subtitle1 text-osmoverse-400">{props.label}</div>
      <h6 className="text-white">{props.value}</h6>
    </div>
  );
}

enum PositionStatus {
  InRange,
  NearBounds,
  outOfRange,
}
function MyPositionStatus(props: { status: PositionStatus }): ReactElement {
  // TODO: use translation
  let label = "IN RANGE";
  if (props.status === PositionStatus.NearBounds) label = "NEAR BOUNDS";
  if (props.status === PositionStatus.outOfRange) label = "OUT OF RANGE";

  return (
    <div
      className={classNames(
        "flex w-fit flex-row items-center gap-[10px] rounded-[12px] px-3 py-1",
        {
          "bg-bullish-600/30": props.status === PositionStatus.InRange,
          "bg-ammelia-600/30": props.status === PositionStatus.NearBounds,
          "bg-rust-600/30": props.status === PositionStatus.outOfRange,
        }
      )}
    >
      <div
        className={classNames("h-3 w-3 rounded-full bg-bullish-500", {
          "bg-bullish-500": props.status === PositionStatus.InRange,
          "bg-ammelia-600": props.status === PositionStatus.NearBounds,
          "bg-rust-500": props.status === PositionStatus.outOfRange,
        })}
      />
      <div className="text-subtitle1">{label}</div>
    </div>
  );
}

// TODO: refactor to standalone component
const PriceChartHeader: FunctionComponent<{
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = observer(({ addLiquidityConfig }) => {
  const {
    historicalRange,
    setHistoricalRange,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    hoverPrice,
    priceDecimal,
  } = addLiquidityConfig;

  const t = useTranslation();

  return (
    <div className="flex flex-row">
      <div className="flex flex-1 flex-row">
        <h4 className="row-span-2 pr-1 font-caption">
          {hoverPrice.toFixed(priceDecimal) || ""}
        </h4>
        <div className="flex flex-col justify-center font-caption">
          <div className="text-caption text-osmoverse-300">
            {t("addConcentratedLiquidity.currentPrice")}
          </div>
          <div className="whitespace-nowrap text-caption text-osmoverse-300">
            {t("addConcentratedLiquidity.basePerQuote", {
              base: baseDepositAmountIn.sendCurrency.coinDenom,
              quote: quoteDepositAmountIn.sendCurrency.coinDenom,
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-row justify-end gap-1 pr-2">
        <RangeSelector
          label="7 day"
          onClick={() => setHistoricalRange("7d")}
          selected={historicalRange === "7d"}
        />
        <RangeSelector
          label="30 day"
          onClick={() => setHistoricalRange("1mo")}
          selected={historicalRange === "1mo"}
        />
        <RangeSelector
          label="1 year"
          onClick={() => setHistoricalRange("1y")}
          selected={historicalRange === "1y"}
        />
      </div>
    </div>
  );
});

function RangeSelector(props: {
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <SelectorWrapper
      label={props.label}
      selected={props.selected}
      onClick={props.onClick}
    />
  );
}

function SelectorWrapper(props: {
  src?: string;
  alt?: string;
  label?: string;
  selected: boolean;
  onClick: () => void;
}) {
  const isImage = !!props.src && !props.label;
  const isLabel = !!props.label && !props.src;

  return (
    <div
      className={classNames(
        "flex h-6 cursor-pointer flex-row items-center justify-center",
        "rounded-lg bg-osmoverse-800 px-2 text-caption hover:bg-osmoverse-900",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {isImage && (
        <Image
          alt={props.alt}
          src={props.src as string}
          width={16}
          height={16}
        />
      )}
      {isLabel && props.label}
    </div>
  );
}

function PriceInputBox(props: {
  label: string;
  currentValue: string;
  infinity?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[9.75rem] flex-col gap-1">
      <span className="pt-2 text-caption text-osmoverse-400">
        {props.label}
      </span>
      {props.infinity ? (
        <div className="flex h-[41px] flex-row items-center">
          <Image
            alt="infinity"
            src="/icons/infinity.svg"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <h6 className="overflow-hidden text-ellipsis border-0 bg-transparent text-subtitle1 leading-tight">
          {props.currentValue}
        </h6>
      )}
    </div>
  );
}
