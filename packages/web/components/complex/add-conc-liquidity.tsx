import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  ObservableAddConcentratedLiquidityConfig,
  ObservableQueryPool,
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

import { ChartButton } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { PriceChartHeader } from "~/components/chart/token-pair-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { useHistoricalAndLiquidityData } from "~/hooks/ui-config/use-historical-and-depth-data";
import { useStore } from "~/stores";
import { ObservableHistoricalAndLiquidityData } from "~/stores/derived-data";
import { formatPretty } from "~/utils/formatter";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "../assets";
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
    const {
      queriesStore,
      chainStore: {
        osmosis: { chainId },
      },
    } = useStore();

    // initialize pool data stores once root pool store is loaded
    const pool = queriesStore.get(chainId).osmosis!.queryPools.getPool(poolId);

    return (
      <div
        className={classNames(
          "flex flex-col",
          addLiquidityConfig.modalView === "overview" ? "gap-8" : "gap-5",
          className
        )}
      >
        {(() => {
          switch (addLiquidityConfig.modalView) {
            case "overview":
              return (
                <Overview
                  pool={pool}
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
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(({ addLiquidityConfig, pool, onRequestClose }) => {
  const { priceStore, queriesExternalStore, derivedDataStore } = useStore();
  const t = useTranslation();
  const [selected, selectView] =
    useState<typeof addLiquidityConfig.modalView>("add_manual");
  const queryGammPoolFeeMetrics = queriesExternalStore.queryGammPoolFeeMetrics;

  const superfluidPoolDetail = derivedDataStore.superfluidPoolDetails.get(
    addLiquidityConfig.poolId
  );

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
                id="close"
                className="text-osmoverse-400 hover:text-white-full"
                width={32}
                height={32}
              />
            }
            onClick={onRequestClose}
          />
        </div>
      </div>
      <div className="flex rounded-[1rem] bg-osmoverse-700/[.3] px-[28px] py-4">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-nowrap items-center gap-2">
            {pool && (
              <>
                <PoolAssetsIcon
                  assets={pool.poolAssets.map(
                    (asset: { amount: CoinPretty }) => ({
                      coinDenom: asset.amount.denom,
                      coinImageUrl: asset.amount.currency.coinImageUrl,
                    })
                  )}
                  size="sm"
                />
                <PoolAssetsName
                  size="md"
                  className="max-w-xs truncate"
                  assetDenoms={pool.poolAssets.map(
                    (asset: { amount: CoinPretty }) => asset.amount.denom
                  )}
                />
              </>
            )}
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
              {pool?.computeTotalValueLocked(priceStore).toString()}
            </h6>
          </div>
          <div className="gap-[3px]">
            <span className="body2 text-osmoverse-400">
              {t("pool.24hrTradingVolume")}
            </span>
            <h6 className="text-osmoverse-100">
              {queryGammPoolFeeMetrics
                .getPoolFeesMetrics(addLiquidityConfig.poolId, priceStore)
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
        <div className="flex justify-center gap-[12px]">
          <div className="cursor-not-allowed opacity-50">
            <StrategySelector
              title={t("addConcentratedLiquidity.managed")}
              description={t("addConcentratedLiquidity.managedDescription")}
              selected={selected === "add_managed"}
              imgSrc="/images/cl-managed-pick-strategy.png"
            />
          </div>
          <div>
            <StrategySelector
              title={t("addConcentratedLiquidity.manual")}
              description={t("addConcentratedLiquidity.manualDescription")}
              selected={selected === "add_manual"}
              onClick={() => selectView("add_manual")}
              imgSrc="/images/cl-manual-pick-strategy.png"
            />
          </div>
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
});

const StrategySelector: FunctionComponent<{
  title: string;
  description: string;
  selected: boolean;
  onClick?: () => void;
  imgSrc: string;
}> = (props) => {
  const { selected, onClick, title, description, imgSrc } = props;
  return (
    <div
      className={classNames(
        "flex flex-1 flex-col items-center justify-center gap-4 rounded-[20px] bg-osmoverse-700/[.6] p-[2px]",
        {
          "bg-supercharged": selected,
          "cursor-pointer hover:bg-supercharged": onClick,
        }
      )}
      onClick={onClick}
    >
      <div
        className={classNames(
          "flex h-full w-full flex-col items-center justify-center gap-[20px] rounded-[19px] py-8 px-4",
          {
            "bg-osmoverse-700": selected,
            "hover:bg-osmoverse-700": Boolean(onClick),
          }
        )}
      >
        <div className="text-h6 font-h6">{title}</div>
        <Image alt="" src={imgSrc} width={354} height={180} />
        <div className="body2 text-center text-osmoverse-200">
          {description}
        </div>
      </div>
    </div>
  );
};

const AddConcLiqView: FunctionComponent<
  {
    pool?: ObservableQueryPool;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  } & CustomClasses
> = observer(({ addLiquidityConfig, actionButton, getFiatValue, pool }) => {
  const {
    poolId,
    range: inputRange,
    fullRange,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    baseDepositOnly,
    quoteDepositOnly,
    depositPercentages,
    currentPrice,
    setModalView,
    setMaxRange,
    setMinRange,
    setFullRange,
    setAnchorAsset,
    setBaseDepositAmountMax,
    setQuoteDepositAmountMax,
  } = addLiquidityConfig;

  const t = useTranslation();

  const { chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const chartConfig = useHistoricalAndLiquidityData(chainId, poolId);

  const { priceDecimal, yRange, xRange, depthChartData } = chartConfig;

  const updateInputAndRangeMinMax = useCallback(
    (min: number, max: number) => {
      setMinRange(new Dec(min));
      setMaxRange(new Dec(max));
    },
    [setMinRange, setMaxRange]
  );

  // sync the price range of the add liq config and the chart config
  useEffect(() => {
    chartConfig.setPriceRange([inputRange[0], inputRange[1]]);
  }, [chartConfig, inputRange]);

  return (
    <>
      <div className="align-center relative flex flex-row">
        <button
          className="absolute left-0 flex h-full cursor-pointer items-center"
          onClick={() => setModalView("overview")}
        >
          <Image
            alt="left"
            src="/icons/arrow-left.svg"
            width={24}
            height={24}
          />
          <span className="body2 pl-1 text-osmoverse-100">
            {t("addConcentratedLiquidity.back")}
          </span>
        </button>
        <h6 className="mx-auto">{t("addConcentratedLiquidity.step2Title")}</h6>
        <span className="caption absolute right-0 flex h-full items-center text-osmoverse-200">
          {t("addConcentratedLiquidity.priceShownIn", {
            base: baseDepositAmountIn.sendCurrency.coinDenom,
            quote: quoteDepositAmountIn.sendCurrency.coinDenom,
          })}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="subtitle1 px-4 pb-3">
          {t("addConcentratedLiquidity.priceRange")}
        </span>
        <div className="flex gap-1">
          <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6">
            <ChartHeader
              chartConfig={chartConfig}
              addLiquidityConfig={addLiquidityConfig}
            />
            <Chart
              chartConfig={chartConfig}
              addLiquidityConfig={addLiquidityConfig}
            />
          </div>
          <div className="flex-shrink-1 flex h-[20.1875rem] w-0 flex-1 rounded-r-2xl bg-osmoverse-700">
            <div className="flex flex-1 flex-col">
              <div className="mt-7 mr-6 mb-8 flex h-6 justify-end gap-1">
                <ChartButton
                  alt="refresh"
                  icon="refresh-ccw"
                  selected={false}
                  onClick={() => chartConfig.setZoom(1)}
                />
                <ChartButton
                  alt="zoom out"
                  icon="zoom-out"
                  selected={false}
                  onClick={chartConfig.zoomOut}
                />
                <ChartButton
                  alt="zoom in"
                  icon="zoom-in"
                  selected={false}
                  onClick={chartConfig.zoomIn}
                />
              </div>
              <ConcentratedLiquidityDepthChart
                min={Number(inputRange[0].toString())}
                max={Number(inputRange[1].toString())}
                yRange={yRange}
                xRange={xRange}
                data={depthChartData}
                annotationDatum={useMemo(
                  () => ({
                    price: Number(currentPrice.toString()) || 0,
                    depth: chartConfig.xRange[1],
                  }),
                  [chartConfig.xRange, currentPrice]
                )}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMax={useCallback(debounce(setMaxRange, 500), [
                  priceDecimal,
                ])}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMin={useCallback(debounce(setMinRange, 500), [
                  priceDecimal,
                ])}
                onSubmitMin={useCallback(
                  (val) => {
                    setMinRange(val);
                    setFullRange(false);
                  },
                  [setMinRange, setFullRange]
                )}
                onSubmitMax={useCallback(
                  (val) => {
                    setMaxRange(val);
                    setFullRange(false);
                  },
                  [setMaxRange, setFullRange]
                )}
                offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                horizontal
                fullRange={fullRange}
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 pr-8">
              <PriceInputBox
                currentValue={
                  fullRange ? "" : formatPretty(inputRange[1]).toString()
                }
                label={t("addConcentratedLiquidity.high")}
                onChange={(val) => setMaxRange(Number(val))}
                onBlur={(e) => setMaxRange(+e.target.value)}
                infinity={fullRange}
              />
              <PriceInputBox
                currentValue={
                  fullRange ? "0" : formatPretty(inputRange[0]).toString()
                }
                label={t("addConcentratedLiquidity.low")}
                onChange={(val) => setMinRange(Number(val))}
                onBlur={(e) => setMinRange(+e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <StrategySelectorGroup
        updateInputAndRangeMinMax={updateInputAndRangeMinMax}
        addLiquidityConfig={addLiquidityConfig}
      />
      <section className="flex flex-col">
        <div className="subtitle1 px-4 pb-3">
          {t("addConcentratedLiquidity.amountToDeposit")}
        </div>
        <div className="flex justify-center gap-3">
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[0]?.amount}
            coinIsToken0={true}
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("base");
                baseDepositAmountIn.setAmount(amount.toString());
              },
              [baseDepositAmountIn, setAnchorAsset]
            )}
            onMax={setBaseDepositAmountMax}
            currentValue={baseDepositAmountIn.amount}
            outOfRange={quoteDepositOnly}
            percentage={depositPercentages[0]}
          />
          <DepositAmountGroup
            getFiatValue={getFiatValue}
            coin={pool?.poolAssets[1]?.amount}
            coinIsToken0={false}
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("quote");
                quoteDepositAmountIn.setAmount(amount.toString());
              },
              [quoteDepositAmountIn, setAnchorAsset]
            )}
            onMax={setQuoteDepositAmountMax}
            currentValue={quoteDepositAmountIn.amount}
            outOfRange={baseDepositOnly}
            percentage={depositPercentages[1]}
          />
        </div>
      </section>
      {actionButton}
    </>
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const ChartHeader: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;

  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = ({ addLiquidityConfig, chartConfig }) => {
  const { baseDepositAmountIn, quoteDepositAmountIn } = addLiquidityConfig;
  const { historicalRange, setHistoricalRange, hoverPrice, priceDecimal } =
    chartConfig;

  return (
    <PriceChartHeader
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDepositAmountIn.sendCurrency.coinDenom}
      quoteDenom={quoteDepositAmountIn.sendCurrency.coinDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
    />
  );
};

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = ({ addLiquidityConfig, chartConfig }) => {
  const { fullRange, range } = addLiquidityConfig;
  const { yRange, historicalChartData, lastChartData, setHoverPrice } =
    chartConfig;

  return (
    <TokenPairHistoricalChart
      data={historicalChartData}
      annotations={
        fullRange
          ? [new Dec(yRange[0] * 1.05), new Dec(yRange[1] * 0.95)]
          : range
      }
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
};

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    updateInputAndRangeMinMax: (min: number, max: number) => void;
  } & CustomClasses
> = observer((props) => {
  const t = useTranslation();
  const { currentStrategy } = props.addLiquidityConfig;

  let descriptionText = t(
    "addConcentratedLiquidity.volatilityCustomDescription"
  );

  if (currentStrategy === "passive") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityPassiveDescription"
    );
  } else if (currentStrategy === "aggressive") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityAggressiveDescription"
    );
  } else if (currentStrategy === "moderate") {
    descriptionText = t(
      "addConcentratedLiquidity.volatilityModerateDescription"
    );
  }

  return (
    <section className="flex flex-row">
      <div className="mx-4 flex flex-col gap-2">
        <span className="subtitle1">
          {t("addConcentratedLiquidity.selectVolatilityRange")}
        </span>
        <span className="caption text-osmoverse-200">
          {descriptionText}
          <a
            className="caption mx-1 inline-flex items-center text-wosmongton-300 underline"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("addConcentratedLiquidity.superchargedLearnMore")}
          </a>
        </span>
      </div>
      <div className="flex flex-1 justify-end gap-2">
        <PresetStrategyCard
          type={null}
          src="/images/small-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Custom"
        />
        <PresetStrategyCard
          type="passive"
          src="/images/small-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Passive"
        />
        <PresetStrategyCard
          type="moderate"
          src="/images/medium-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Moderate"
        />
        <PresetStrategyCard
          type="aggressive"
          src="/images/large-vial.svg"
          updateInputAndRangeMinMax={props.updateInputAndRangeMinMax}
          addLiquidityConfig={props.addLiquidityConfig}
          label="Aggressive"
        />
      </div>
    </section>
  );
});

const PresetStrategyCard: FunctionComponent<
  {
    type: null | "passive" | "moderate" | "aggressive";
    src: string;
    updateInputAndRangeMinMax: (min: number, max: number) => void;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    label: string;
    width?: number;
    height?: number;
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
    const {
      currentStrategy,
      setFullRange,
      aggressivePriceRange,
      moderatePriceRange,
    } = addLiquidityConfig;

    const isSelected = type === currentStrategy;

    const onClick = () => {
      switch (type) {
        case "passive":
          setFullRange(true);
          return;
        case "moderate":
          setFullRange(false);
          updateInputAndRangeMinMax(
            Number(moderatePriceRange[0].toString()),
            Number(moderatePriceRange[1].toString())
          );
          return;
        case "aggressive":
          setFullRange(false);
          updateInputAndRangeMinMax(
            Number(aggressivePriceRange[0].toString()),
            Number(aggressivePriceRange[1].toString())
          );
          return;
      }
    };

    return (
      <div
        className={classNames(
          "flex w-[114px] items-center justify-center gap-2 rounded-2xl p-[2px]",
          {
            "bg-supercharged": isSelected,
            "cursor-pointer hover:bg-supercharged": type !== null,
          }
        )}
        onClick={onClick}
      >
        <div className="flex h-full w-full flex-col rounded-2xlinset bg-osmoverse-700 p-3">
          <div
            className={classNames("mx-auto transform transition-transform", {
              "scale-110": isSelected,
            })}
          >
            <Image
              alt="volatility-selection"
              src={src}
              width={width || 64}
              height={height || 64}
            />
          </div>
          <span
            className={classNames("body2 text-center", {
              "text-osmoverse-200": !isSelected,
            })}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }
);

const PriceInputBox: FunctionComponent<{
  label: string;
  currentValue: string;
  onChange: (val: string) => void;
  onBlur: (e: any) => void;
  infinity?: boolean;
}> = ({ label, currentValue, onChange, onBlur, infinity }) => (
  <div className="flex w-full max-w-[9.75rem] flex-col items-end rounded-xl bg-osmoverse-800 px-2">
    <span className="caption px-2 pt-2 text-osmoverse-400">{label}</span>
    {infinity ? (
      <div className="flex h-[41px] items-center px-2">
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
        currentValue={currentValue}
        onInput={(val) => onChange(val)}
        onBlur={onBlur}
      />
    )}
  </div>
);
