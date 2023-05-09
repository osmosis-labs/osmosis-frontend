import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  calculateDepositAmountForBase,
  calculateDepositAmountForQuote,
  priceToTick,
  roundPriceToNearestTick,
} from "@osmosis-labs/math";
import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import {
  ObservableAddConcentratedLiquidityConfig,
  ObservablePoolDetail,
  ObservableQueryPool,
  ObservableSuperfluidPoolDetail,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import debounce from "debounce";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import IconButton from "~/components/buttons/icon-button";
import { useStore } from "~/stores";

import { Icon, PoolAssetsIcon } from "../assets";
import { Button } from "../buttons";
import { InputBox } from "../input";
import { CustomClasses } from "../types";

const ConcentratedLiquidityDepthChart = dynamic(
  () => import("~/components/chart/concentrated-liquidity-depth"),
  { ssr: false }
);
const TokenPairHistoricalChart = dynamic(
  () => import("~/components/chart/token-pair-historical"),
  { ssr: false }
);

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(
  ({
    className,
    addLiquidityConfig,
    actionButton,
    getFiatValue,
    onRequestClose,
  }) => {
    const { poolId } = addLiquidityConfig;
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
          .map(({ amount }) => amount.denom)
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
          switch (addLiquidityConfig.modalView) {
            case "overview":
              return (
                <Overview
                  pool={pool}
                  poolName={poolName}
                  poolDetail={poolDetail}
                  superfluidPoolDetail={superfluidPoolDetail}
                  addLiquidityConfig={addLiquidityConfig}
                  onRequestClose={onRequestClose}
                />
              );
            case "add_manual":
              return (
                <AddConcLiqView
                  getFiatValue={getFiatValue}
                  pool={pool}
                  addLiquidityConfig={addLiquidityConfig}
                  actionButton={actionButton}
                />
              );
            case "add_managed":
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
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(
  ({
    addLiquidityConfig,
    pool,
    poolName,
    superfluidPoolDetail,
    poolDetail,
    onRequestClose,
  }) => {
    const { priceStore, queriesExternalStore } = useStore();
    const { poolId } = addLiquidityConfig;
    const t = useTranslation();
    const [selected, selectView] =
      useState<typeof addLiquidityConfig.modalView>("add_manual");
    const queryGammPoolFeeMetrics =
      queriesExternalStore.queryGammPoolFeeMetrics;

    return (
      <>
        <div className="align-center relative flex flex-row">
          <div className="absolute left-0 flex h-full items-center text-sm" />
          <h6 className="flex-1 text-center">
            {t("addConcentratedLiquidity.step1Title")}
          </h6>
          <div className="absolute right-0">
            <IconButton
              aria-label="Close"
              mode="unstyled"
              size="unstyled"
              className="!p-0"
              icon={
                <Icon
                  id="close-thin"
                  className="text-wosmongton-400 hover:text-wosmongton-100"
                  height={24}
                  width={24}
                />
              }
              onClick={onRequestClose}
            />
          </div>
        </div>
        <div className="flex flex-row rounded-[1rem] bg-osmoverse-700/[.3] px-[28px] py-4">
          <div className="flex flex-1 flex-col gap-1">
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
              <h6 className="max-w-xs truncate">{poolName}</h6>
            </div>
            {!superfluidPoolDetail?.isSuperfluid && (
              <span className="body2 text-superfluid-gradient">
                {t("pool.superfluidEnabled")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-10">
            <div className="gap-[3px]">
              <span className="body2 text-osmoverse-400">
                {t("pool.liquidity")}
              </span>
              <h6 className="text-osmoverse-100">
                {poolDetail?.totalValueLocked.toString()}
              </h6>
            </div>
            <div className="gap-[3px]">
              <span className="body2 text-osmoverse-400">
                {t("pool.24hrTradingVolume")}
              </span>
              <h6 className="text-osmoverse-100">
                {queryGammPoolFeeMetrics
                  .getPoolFeesMetrics(poolId, priceStore)
                  .volume24h.toString()}
              </h6>
            </div>
            <div className="gap-[3px]">
              <span className="body2 text-osmoverse-400">
                {t("pool.swapFee")}
              </span>
              <h6 className="text-osmoverse-100">{pool?.swapFee.toString()}</h6>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row justify-center gap-[12px]">
            <StrategySelector
              title={t("addConcentratedLiquidity.managed")}
              description={t("addConcentratedLiquidity.managedDescription")}
              selected={selected === "add_managed"}
              imgSrc="/images/managed_liquidity_mock.png"
            />
            <StrategySelector
              title={t("addConcentratedLiquidity.manual")}
              description={t("addConcentratedLiquidity.manualDescription")}
              selected={selected === "add_manual"}
              onClick={() => selectView("add_manual")}
              imgSrc="/images/conliq_mock_range.png"
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <Button
            className="w-[25rem]"
            onClick={() => addLiquidityConfig.setModalView(selected)}
          >
            {t("pools.createPool.buttonNext")}
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
  onClick?: () => void;
  imgSrc: string;
}) {
  const { selected, onClick, title, description, imgSrc } = props;
  return (
    <div
      className={classNames(
        "flex flex-1 flex-col items-center justify-center gap-4 rounded-[20px] bg-osmoverse-700/[.6] p-[2px]",
        {
          "bg-supercharged-gradient": selected,
          "hover:bg-supercharged-gradient cursor-pointer": onClick,
        }
      )}
      onClick={onClick}
    >
      <div
        className={classNames(
          "flex h-full w-full flex-col items-center justify-center gap-[20px] rounded-[19px] py-8 px-4",
          {
            "bg-osmoverse-700": selected,
            "hover:bg-osmoverse-700": onClick,
          }
        )}
      >
        <div className="mb-16 text-h6 font-h6">{title}</div>
        <Image alt="" src={imgSrc} width={255} height={145} />
        <div className="text-center text-body2 font-body2 text-osmoverse-200">
          {description}
        </div>
      </div>
    </div>
  );
}

const AddConcLiqView: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(({ addLiquidityConfig, actionButton, getFiatValue, pool }) => {
  const baseDenom = pool?.poolAssets[0]?.amount.denom || "";
  const quoteDenom = pool?.poolAssets[1]?.amount.denom || "";
  const {
    poolId,
    historicalRange,
    range,
    quoteDepositAmountIn,
    baseDepositAmountIn,
    fullRange,
    historicalChartData,
    lastChartData,
    setQuoteDepositAmountIn,
    setBaseDepositAmountIn,
    setModalView,
    setHistoricalRange,
    setMaxRange,
    setMinRange,
    setHistoricalChartData,
  } = addLiquidityConfig;

  const { queriesExternalStore, chainStore, queriesStore } = useStore();
  const t = useTranslation();

  const [inputMin, setInputMin] = useState("0");
  const [inputMax, setInputMax] = useState("0");
  const rangeMin = Number(range[0].toString());
  const rangeMax = Number(range[1].toString());

  const { chainId } = chainStore.osmosis;
  const queriesOsmosis = queriesStore.get(chainId).osmosis!;
  const queryDepth =
    queriesOsmosis.queryLiquiditiesPerTickRange.getForPoolId(poolId);
  const queryHistorical =
    queriesExternalStore.queryTokenPairHistoricalChart.get(
      poolId,
      addLiquidityConfig.historicalRange,
      baseDenom,
      quoteDenom
    );

  const yRange = addLiquidityConfig.yRange;

  const clPool = pool?.pool as ConcentratedLiquidityPool;

  const updateInputAndRangeMinMax = useCallback(
    (_min: number, _max: number) => {
      setInputMin("" + _min);
      setInputMax("" + _max);
      setMinRange(new Dec(_min));
      setMaxRange(new Dec(_max));
    },
    []
  );

  useEffect(() => {
    if (!queryHistorical.isFetching && queryHistorical.getChartPrices.length) {
      const newData = queryHistorical.getChartPrices;
      setHistoricalChartData(newData);
    }
  }, [queryHistorical.getChartPrices, queryHistorical.isFetching]);

  useEffect(() => {
    if (!yRange[0] && !yRange[1]) return;
    if (!queryDepth.isFetching && queryDepth.activeLiquidity) {
      addLiquidityConfig.setActiveLiquidity(queryDepth.activeLiquidity);
    }
  }, [
    yRange[0],
    yRange[1],
    clPool?.exponentAtPriceOne,
    queryDepth.isFetching,
    queryDepth.activeLiquidity,
  ]);

  useEffect(() => {
    if (lastChartData && inputMin === "0" && inputMax === "0") {
      const last = lastChartData.close;
      updateInputAndRangeMinMax(last * 0.75, last * 1.25);
    }
  }, [lastChartData, inputMax, inputMin]);

  return (
    <>
      <div className="align-center relative flex flex-row">
        <div
          className="absolute left-0 flex flex h-full cursor-pointer flex-row items-center text-sm"
          onClick={() => setModalView("overview")}
        >
          <Image src="/icons/arrow-left.svg" width={24} height={24} />
          <span className="pl-1">{t("addConcentratedLiquidity.back")}</span>
        </div>
        <div className="flex-1 text-center text-lg">
          {t("addConcentratedLiquidity.step2Title")}
        </div>
        <div className="absolute right-0 flex h-full items-center text-xs font-subtitle2 text-osmoverse-200">
          {t("addConcentratedLiquidity.priceShownIn", {
            base: baseDenom,
            quote: quoteDenom,
          })}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="px-2 py-1 text-sm">
          {t("addConcentratedLiquidity.priceRange")}
        </div>
        <div className="flex flex-row gap-1">
          <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col rounded-l-2xl bg-osmoverse-700 pl-6">
            <div className="flex flex-row">
              <div className="flex flex-1 flex-row pt-4">
                <h4 className="row-span-2 pr-1 font-caption">
                  {lastChartData?.close.toFixed(2) || ""}
                </h4>
                <div className="flex flex-col justify-center font-caption">
                  <div className="text-caption text-osmoverse-300">
                    {t("addConcentratedLiquidity.currentPrice")}
                  </div>
                  <div className="text-caption text-osmoverse-300">
                    {t("addConcentratedLiquidity.basePerQuote", {
                      base: baseDenom,
                      quote: quoteDenom,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-row justify-end gap-1 pt-2 pr-2">
                <RangeSelector
                  label="7 day"
                  onClick={() => setHistoricalRange("7d")}
                  selected={historicalRange === "7d"}
                />
                <RangeSelector
                  label="30 days"
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
            <TokenPairHistoricalChart
              data={historicalChartData.map(({ time, close }) => ({
                time,
                price: close,
              }))}
              annotations={
                fullRange
                  ? [new Dec(yRange[0] * 1.05), new Dec(yRange[1] * 0.95)]
                  : range
              }
              domain={yRange}
            />
          </div>
          <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-row rounded-r-2xl bg-osmoverse-700">
            <div className="flex flex-1 flex-col">
              <div className="mt-7 mr-6 flex h-6 flex-row justify-end gap-1">
                <SelectorWrapper
                  alt="refresh"
                  src="/icons/refresh-ccw.svg"
                  selected={false}
                  onClick={() => addLiquidityConfig.setZoom(1)}
                />
                <SelectorWrapper
                  alt="zoom in"
                  src="/icons/zoom-in.svg"
                  selected={false}
                  onClick={addLiquidityConfig.zoomIn}
                />
                <SelectorWrapper
                  alt="zoom out"
                  src="/icons/zoom-out.svg"
                  selected={false}
                  onClick={addLiquidityConfig.zoomOut}
                />
              </div>
              <ConcentratedLiquidityDepthChart
                min={rangeMin}
                max={rangeMax}
                yRange={yRange}
                xRange={addLiquidityConfig.xRange}
                data={addLiquidityConfig.depthChartData}
                annotationDatum={{
                  price: lastChartData?.close || 0,
                  depth: addLiquidityConfig.xRange[1],
                }}
                onMoveMax={debounce(
                  (val: number) => setInputMax("" + val),
                  500
                )}
                onMoveMin={debounce(
                  (val: number) => setInputMin("" + val),
                  500
                )}
                onSubmitMin={(val) => {
                  setMinRange(val);
                  addLiquidityConfig.setFullRange(false);
                }}
                onSubmitMax={(val) => {
                  setMaxRange(val);
                  addLiquidityConfig.setFullRange(false);
                }}
                offset={{ top: 0, right: 36, bottom: 36, left: 0 }}
                horizontal
                fullRange={fullRange}
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 pr-8">
              <PriceInputBox
                currentValue={fullRange ? "" : new Dec(inputMax).toString(4)}
                label="high"
                onChange={setInputMax}
                onBlur={(e) => setMaxRange(+e.target.value)}
                infinity={fullRange}
              />
              <PriceInputBox
                currentValue={fullRange ? "0" : new Dec(inputMin).toString(4)}
                label="low"
                onChange={setInputMin}
                onBlur={(e) => setMinRange(+e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <VolitilitySelectorGroup
        updateInputAndRangeMinMax={updateInputAndRangeMinMax}
        addLiquidityConfig={addLiquidityConfig}
      />
      <div className="flex flex-col">
        <div className="px-2 py-1 text-sm">
          {t("addConcentratedLiquidity.amountToDeposit")}
        </div>
        <div className="flex flex-row justify-center gap-3">
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[0]?.amount}
            onUpdate={(amount) => {
              setBaseDepositAmountIn(amount);
              if (clPool) {
                const [lowerTick, upperTick] = addLiquidityConfig.tickRange;
                const quoteDeposit = calculateDepositAmountForQuote(
                  clPool.currentSqrtPrice.mul(clPool.currentSqrtPrice),
                  lowerTick,
                  upperTick,
                  new Dec(amount)
                );
                setQuoteDepositAmountIn(quoteDeposit);
              }
            }}
            currentValue={baseDepositAmountIn}
          />
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[1]?.amount}
            onUpdate={(amount) => {
              setQuoteDepositAmountIn(amount);
              if (clPool) {
                const [lowerTick, upperTick] = addLiquidityConfig.tickRange;
                const quoteDeposit = calculateDepositAmountForBase(
                  clPool.currentSqrtPrice.mul(clPool.currentSqrtPrice),
                  lowerTick,
                  upperTick,
                  new Dec(amount)
                );
                setBaseDepositAmountIn(quoteDeposit);
              }
            }}
            currentValue={quoteDepositAmountIn}
          />
        </div>
      </div>
      {actionButton}
    </>
  );
});

const VolitilitySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    updateInputAndRangeMinMax: (min: number, max: number) => void;
  } & CustomClasses
> = observer((props) => {
  const t = useTranslation();

  return (
    <div className="flex flex-row">
      <div className="mx-4 flex max-w-[16.375rem] flex-col">
        <div className="text-subtitle1">
          {t("addConcentratedLiquidity.selectVolatilityRange")}
        </div>
        <div className="text-caption font-caption text-osmoverse-200">
          {t("addConcentratedLiquidity.volatilityDescription")}
        </div>
        <a
          className="flex flex-row items-center text-caption font-caption text-wosmongton-300"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("addConcentratedLiquidity.superchargedLearnMore")}
          <Image
            alt="learn more"
            src="/icons/arrow-right.svg"
            height={12}
            width={12}
          />
        </a>
      </div>
      <div className="flex flex-1 flex-row justify-end gap-2">
        <PresetVolatilityCard
          type="custom"
          src="/images/small-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Custom"
        />
        <PresetVolatilityCard
          type="passive"
          src="/images/small-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Passive"
        />
        <PresetVolatilityCard
          type="moderate"
          src="/images/medium-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Moderate"
        />
        <PresetVolatilityCard
          type="aggressive"
          src="/images/large-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Aggressive"
        />
      </div>
    </div>
  );
});

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
        "flex h-6 cursor-pointer flex-row items-center justify-center rounded-lg bg-osmoverse-800 px-2 text-xs hover:bg-osmoverse-900",
        {
          "!bg-osmoverse-900": props.selected,
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

const DepositAmountGroup: FunctionComponent<{
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  coin?: CoinPretty;
  onUpdate: (amount: number) => void;
  currentValue: Dec;
}> = observer(({ coin, onUpdate, currentValue }) => {
  const { priceStore, chainStore, queriesStore, accountStore } = useStore();

  const { chainId } = chainStore.osmosis;
  // const { nativeBalances, ibcBalances } = assetsStore;
  const { bech32Address } = accountStore.getAccount(chainId);

  const fiatPer = coin?.currency.coinGeckoId
    ? priceStore.getPrice(coin.currency.coinGeckoId, undefined)
    : 0;

  const walletBalance = coin?.currency
    ? queriesStore
        .get(chainId)
        .queryBalances.getQueryBech32Address(bech32Address)
        .getBalanceFromCurrency(coin.currency)
    : null;

  const updateValue = useCallback(
    (val: string) => {
      const newVal = Number(val);
      onUpdate(newVal);
    },
    [onUpdate]
  );

  return (
    <div className="flex flex-1 flex-shrink-0 flex-row items-center rounded-[20px] bg-osmoverse-700 p-[1.25rem]">
      <div className="flex w-full flex-row items-center">
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
        <div className="flex flex-1 flex-col">
          <div className="text-right text-caption text-wosmongton-300">
            {walletBalance ? walletBalance.toString() : ""}
          </div>
          <div className="flex h-16 w-[158px] flex-col items-end justify-center self-end rounded-[12px] bg-osmoverse-800">
            <InputBox
              className="border-0 bg-transparent text-h5"
              inputClassName="!leading-4"
              type="number"
              currentValue={currentValue.toString(4).trim()}
              onInput={updateValue}
              rightEntry
            />
            <div className="pr-3 text-caption text-osmoverse-400">
              {fiatPer && `~$${currentValue.mul(new Dec(fiatPer)).toString(2)}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const PresetVolatilityCard: FunctionComponent<
  {
    type: "custom" | "passive" | "moderate" | "aggressive";
    src: string;
    updateInputAndRangeMinMax: (min: number, max: number) => void;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    label: string;
    width?: number;
    height?: number;
    selected?: boolean;
  } & CustomClasses
> = observer(
  ({
    type,
    src,
    width,
    height,
    label,
    addLiquidityConfig,
    updateInputAndRangeMinMax,
  }) => {
    const { tickRange, fullRange, setFullRange, lastChartData } =
      addLiquidityConfig;
    const lastPrice = lastChartData?.close || 0;

    const moderateTicks = [
      priceToTick(roundPriceToNearestTick(new Dec(lastPrice * 0.75))),
      priceToTick(roundPriceToNearestTick(new Dec(lastPrice * 1.25))),
    ];
    const aggressiveTicks = [
      priceToTick(roundPriceToNearestTick(new Dec(lastPrice * 0.5))),
      priceToTick(roundPriceToNearestTick(new Dec(lastPrice * 1.5))),
    ];

    const isRangePassive = fullRange;
    const isRangeAggressive =
      !isRangePassive &&
      tickRange[0].equals(aggressiveTicks[0]) &&
      tickRange[1].equals(aggressiveTicks[1]);
    const isRangeModerate =
      !isRangePassive &&
      tickRange[0].equals(moderateTicks[0]) &&
      tickRange[1].equals(moderateTicks[1]);
    const isRangeCustom =
      !isRangeAggressive && !isRangeModerate && !isRangePassive;

    let isSelected = false;

    if (type === "moderate") isSelected = isRangeModerate;
    if (type === "aggressive") isSelected = isRangeAggressive;
    if (type === "passive") isSelected = isRangePassive;
    if (type === "custom") isSelected = isRangeCustom;

    const onClick = useCallback(() => {
      switch (type) {
        case "passive":
          setFullRange(true);
          return;
        case "moderate":
          setFullRange(false);
          updateInputAndRangeMinMax(lastPrice * 0.75, lastPrice * 1.25);
          return;
        case "aggressive":
          setFullRange(false);
          updateInputAndRangeMinMax(lastPrice * 0.5, lastPrice * 1.5);
          return;
      }
    }, [type, setFullRange, updateInputAndRangeMinMax, lastPrice]);

    return (
      <div
        className={classNames(
          "flex w-[114px] cursor-pointer flex-row items-center justify-center gap-2 p-[2px]",
          "rounded-2xl",
          "hover:bg-supercharged-gradient",
          {
            "bg-supercharged-gradient": isSelected,
          }
        )}
        onClick={onClick}
      >
        <div className="flex h-full w-full flex-col rounded-2xl bg-osmoverse-700 p-3">
          <Image
            alt=""
            className="flex-0 ml-2"
            src={src}
            width={width || 64}
            height={height || 64}
          />
          <div className="text-center text-body2 font-body2 text-osmoverse-200">
            {label}
          </div>
        </div>
      </div>
    );
  }
);

function PriceInputBox(props: {
  label: string;
  currentValue: string;
  onChange: (val: string) => void;
  onBlur: (e: any) => void;
  infinity?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[9.75rem] flex-col items-end rounded-xl bg-osmoverse-800 px-2">
      <span className="px-2 pt-2 text-caption text-osmoverse-400">
        {props.label}
      </span>
      {props.infinity ? (
        <div className="flex h-[41px] flex-row items-center px-2">
          <Image
            alt="infinity"
            src="/icons/infinity.svg"
            width={16}
            height={16}
          />
        </div>
      ) : (
        <InputBox
          className="border-0 bg-transparent text-subtitle1 leading-tight"
          type="number"
          rightEntry
          currentValue={props.currentValue}
          onInput={(val) => props.onChange(val)}
          onBlur={props.onBlur}
        />
      )}
    </div>
  );
}
