import {
  calcCapitalEfficiency,
  calcPositionValueVsHold,
} from "@osmosis-labs/math";
import type { Pool } from "@osmosis-labs/server";
import { Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
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
  useRef,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/price-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { InputBox } from "~/components/input";
import { Spinner } from "~/components/loaders/spinner";
import { CustomClasses } from "~/components/types";
import { ChartButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DetentSlider } from "~/components/ui/detent-slider";
import { EventName } from "~/config/analytics-events";
import {
  ObservableAddConcentratedLiquidityConfig,
  useAmplitudeAnalytics,
  useTranslation,
} from "~/hooks";
import {
  ObservableHistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { useStore } from "~/stores";
import { calcSigmaRange } from "~/utils/cl-sigma-range";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { api } from "~/utils/trpc";

import { Tooltip } from "../tooltip";

// TODO: don't think these dynamic imports are needed or are set up properly
const ConcentratedLiquidityDepthChart = dynamic(
  () =>
    import("~/components/chart/concentrated-liquidity-depth").then(
      (module) => module.ConcentratedLiquidityDepthChart
    ),
  { ssr: false }
);
const HistoricalPriceChart = dynamic(
  () =>
    import("~/components/chart/price-historical").then(
      (module) => module.HistoricalPriceChart
    ),
  { ssr: false }
);

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(({ className, addLiquidityConfig, actionButton }) => {
  const { poolId } = addLiquidityConfig;

  const { data: pool } = api.local.pools.getPool.useQuery({
    poolId,
  });

  return (
    <div className={classNames("flex flex-col gap-5", className)}>
      <AddConcLiqView
        pool={pool}
        addLiquidityConfig={addLiquidityConfig}
        actionButton={actionButton}
      />
    </div>
  );
});

const AddConcLiqView: FunctionComponent<
  {
    pool?: Pool;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    isInactivePool?: boolean;
  } & CustomClasses
> = observer(({ addLiquidityConfig, actionButton, pool, isInactivePool }) => {
  const {
    poolId,
    rangeWithCurrencyDecimals,
    fullRange,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    baseDepositOnly,
    quoteDepositOnly,
    depositPercentages,
    currentPriceWithDecimals,
    shouldBeSuperfluidStaked,
    tickRange,
    error: addLiqError,
    setElectSuperfluidStaking,
    setMaxRange,
    setMinRange,
    setAnchorAsset,
    setBaseDepositAmountMax,
    setQuoteDepositAmountMax,
    setFullRange,
  } = addLiquidityConfig;

  const { t } = useTranslation();
  const highSpotPriceInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedInactivePool = useRef(false);

  const [persistedAdvanced, setPersistedAdvanced] = useLocalStorageState<{
    enabled?: boolean;
  } | null>(ADV_LP_STORAGE_KEY, null);
  const [advancedEnabled, setAdvancedEnabledState] = useState(false);
  // Hydrate the toggle from localStorage on mount.
  useEffect(() => {
    if (persistedAdvanced && typeof persistedAdvanced.enabled === "boolean") {
      setAdvancedEnabledState(persistedAdvanced.enabled);
    }
    // Only run on mount; subsequent persistence is handled by setAdvancedEnabled.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydrate
  }, []);
  const setAdvancedEnabled = useCallback(
    (next: boolean) => {
      setAdvancedEnabledState(next);
      setPersistedAdvanced({ ...(persistedAdvanced ?? {}), enabled: next });
    },
    [persistedAdvanced, setPersistedAdvanced]
  );

  // When the user manually edits the high/low price (typing in a price box
  // or dragging the depth-chart bars), drop out of advanced mode so the
  // selection reflects "Custom" — matching how the legacy presets work.
  const onManualPriceEdit = useCallback(() => {
    setAdvancedEnabled(false);
  }, [setAdvancedEnabled]);

  const { derivedDataStore, queriesExternalStore } = useStore();
  const chartConfig = useHistoricalAndLiquidityData(poolId);

  // Default to passive strategy for inactive pools (only on mount)
  useEffect(() => {
    if (isInactivePool && !fullRange && !hasInitializedInactivePool.current) {
      setFullRange(true);
      hasInitializedInactivePool.current = true;
    }
  }, [isInactivePool, fullRange, setFullRange]);

  const superfluidPoolDetail =
    derivedDataStore.superfluidPoolDetails.get(poolId);

  const { yRange, xRange, depthChartData } = chartConfig;

  const sfStakingDisabled = !fullRange || Boolean(addLiqError);

  const queryCurrentRangeApr = fullRange
    ? queriesExternalStore.queryPriceRangeAprs.get(poolId)
    : queriesExternalStore.queryPriceRangeAprs.get(
        poolId,
        tickRange[0],
        tickRange[1]
      );
  // sync the price range of the add liq config and the chart config
  // sync the initial hover price
  // TODO: this is a code smell. the chart config should observe the add liq config
  //        this may be acieved by using an interface
  useEffect(() => {
    chartConfig.setPriceRange(rangeWithCurrencyDecimals);
  }, [chartConfig, rangeWithCurrencyDecimals]);

  // Ratchet the price chart's timeframe up so it always encloses the
  // advanced lookback window (a 7d chart can't show a 30d lookback). Up
  // only, per design: shrinking the lookback never narrows the chart back.
  const advancedLookbackDays = addLiquidityConfig.lookbackDays;
  useEffect(() => {
    if (!advancedEnabled) return;
    const current = chartConfig.historicalRange;
    if (advancedLookbackDays > 30) {
      if (current !== "1y") chartConfig.setHistoricalRange("1y");
    } else if (advancedLookbackDays > 7 && current === "7d") {
      chartConfig.setHistoricalRange("1mo");
    }
  }, [advancedEnabled, advancedLookbackDays, chartConfig]);

  return (
    <>
      <div className="align-center relative flex flex-row xs:items-center xs:gap-4">
        <h6 className="mx-auto whitespace-nowrap">
          {t("addConcentratedLiquidity.step1Title")}
        </h6>
        <span className="caption absolute right-0 flex h-full items-center text-osmoverse-200 md:hidden">
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
        <div className="flex w-full gap-1">
          <div className="flex h-[20.1875rem] flex-grow flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6 md:hidden">
            {chartConfig.isHistoricalDataLoading ? (
              <Spinner className="m-auto" />
            ) : chartConfig.historicalChartUnavailable ? (
              <ChartUnavailable />
            ) : (
              <>
                <ChartHeader
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
                <Chart
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
              </>
            )}
          </div>
          <div className="relative flex h-[20.1875rem] w-96 rounded-r-2xl bg-osmoverse-700 md:rounded-l-2xl">
            <div className="flex flex-1 flex-col">
              <div className="mb-8 mr-6 mt-7 flex h-6 justify-end gap-1 xs:ml-4">
                <ChartButton
                  alt="refresh"
                  icon="refresh-ccw"
                  selected={false}
                  onClick={() => chartConfig.resetZoom()}
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
                min={Number(rangeWithCurrencyDecimals[0].toString())}
                max={Number(rangeWithCurrencyDecimals[1].toString())}
                yRange={yRange}
                xRange={xRange}
                data={depthChartData}
                annotationDatum={useMemo(
                  () => ({
                    price: Number(currentPriceWithDecimals.toString()),
                    depth: chartConfig.xRange[1],
                  }),
                  [chartConfig.xRange, currentPriceWithDecimals]
                )}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMax={useCallback(
                  debounce((num: number) => {
                    onManualPriceEdit();
                    setMaxRange(num.toString());
                  }, 250),
                  [onManualPriceEdit]
                )}
                // eslint-disable-next-line react-hooks/exhaustive-deps
                onMoveMin={useCallback(
                  debounce((num: number) => {
                    onManualPriceEdit();
                    setMinRange(num.toString());
                  }, 250),
                  [onManualPriceEdit]
                )}
                onSubmitMin={useCallback(
                  (val: number) => {
                    onManualPriceEdit();
                    setMinRange(val.toString());
                  },
                  [setMinRange, onManualPriceEdit]
                )}
                onSubmitMax={useCallback(
                  (val: number) => {
                    onManualPriceEdit();
                    setMaxRange(val.toString());
                  },
                  [setMaxRange, onManualPriceEdit]
                )}
                offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                horizontal
                fullRange={fullRange}
              />
              {queryCurrentRangeApr.apr && (
                <div className="absolute right-8 top-5 flex select-none flex-col text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-osmoverse-300">
                      {t("addConcentratedLiquidity.estimated")}
                    </span>
                    <Tooltip
                      content={
                        <span>
                          {t("addConcentratedLiquidity.estimatedInfo")}
                        </span>
                      }
                    >
                      <Icon id="info" height={15} width={15} />
                    </Tooltip>
                  </div>
                  {queryCurrentRangeApr.isFetching ? (
                    <Spinner className="m-auto mt-1.5" />
                  ) : (
                    <h5 className="text-osmoverse-100">
                      {queryCurrentRangeApr.apr.maxDecimals(1).toString() ?? ""}{" "}
                      {t("pool.APR")}
                    </h5>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-4 pr-8 sm:pr-3">
              <PriceInputBox
                label={t("addConcentratedLiquidity.high")}
                forPriceIndex={1}
                addConcLiquidityConfig={addLiquidityConfig}
                inputRef={highSpotPriceInputRef}
                onManualEdit={onManualPriceEdit}
              />
              <PriceInputBox
                label={t("addConcentratedLiquidity.low")}
                forPriceIndex={0}
                addConcLiquidityConfig={addLiquidityConfig}
                onManualEdit={onManualPriceEdit}
              />
            </div>
          </div>
        </div>
      </div>
      <StrategySelectorGroup
        addLiquidityConfig={addLiquidityConfig}
        highSpotPriceInputRef={highSpotPriceInputRef}
        isInactivePool={isInactivePool}
        advancedEnabled={advancedEnabled}
        onAdvancedToggle={setAdvancedEnabled}
      />
      {advancedEnabled && (
        <BacktestPanel
          addLiquidityConfig={addLiquidityConfig}
          rangeApr={queryCurrentRangeApr.apr}
        />
      )}
      <section className="flex flex-col">
        <div className="subtitle1 flex place-content-between items-baseline px-4 pb-3">
          {t("addConcentratedLiquidity.amountToDeposit")}
          {superfluidPoolDetail.isSuperfluid && (
            <div className="flex gap-3">
              <Checkbox
                id="superfluid-stake"
                variant="secondary"
                checked={shouldBeSuperfluidStaked}
                onClick={() => {
                  setElectSuperfluidStaking(!shouldBeSuperfluidStaked);
                }}
                disabled={sfStakingDisabled}
              />
              <label
                htmlFor="superfluid-stake"
                className={classNames("flex flex-col gap-1", {
                  "opacity-30": sfStakingDisabled,
                })}
              >
                <h6 className="md:text-subtitle1 md:font-subtitle1">
                  {t("lockToken.superfluidStake")}{" "}
                  {superfluidPoolDetail.superfluidApr.toDec().isPositive()
                    ? `(+${superfluidPoolDetail.superfluidApr.maxDecimals(
                        0
                      )} APR)`
                    : undefined}
                </h6>
                <span className="caption text-osmoverse-300">
                  {t("lockToken.bondingRequirement", {
                    numDays: superfluidPoolDetail.unstakingDuration
                      .asDays()
                      .toString(),
                  })}
                </span>
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-3 md:flex-col">
          <DepositAmountGroup
            currency={pool?.reserveCoins[0]?.currency}
            className="md:!px-4 md:!py-4"
            priceInputClass=" md:!w-full"
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("base");
                baseDepositAmountIn.setAmount(amount);
              },
              [baseDepositAmountIn, setAnchorAsset]
            )}
            onMax={setBaseDepositAmountMax}
            currentValue={baseDepositAmountIn.amount}
            outOfRange={quoteDepositOnly}
            percentage={depositPercentages[0]}
          />
          <DepositAmountGroup
            currency={pool?.reserveCoins[1]?.currency}
            className="md:!px-4 md:!py-4"
            priceInputClass=" md:!w-full"
            onUpdate={useCallback(
              (amount) => {
                setAnchorAsset("quote");
                quoteDepositAmountIn.setAmount(amount);
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
}> = observer(({ addLiquidityConfig, chartConfig }) => {
  const { baseDepositAmountIn, quoteDepositAmountIn } = addLiquidityConfig;
  const { historicalRange, setHistoricalRange, hoverPrice, priceDecimal } =
    chartConfig;

  const formatOpts = useMemo(
    () => getPriceExtendedFormatOptions(new Dec(hoverPrice)),
    [hoverPrice]
  );

  return (
    <PriceChartHeader
      formatOpts={formatOpts}
      historicalRange={historicalRange}
      setHistoricalRange={setHistoricalRange}
      baseDenom={baseDepositAmountIn.sendCurrency.coinDenom}
      quoteDenom={quoteDepositAmountIn.sendCurrency.coinDenom}
      hoverPrice={hoverPrice}
      decimal={priceDecimal}
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  chartConfig: ObservableHistoricalAndLiquidityData;
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = observer(({ addLiquidityConfig, chartConfig }) => {
  const { fullRange, rangeWithCurrencyDecimals } = addLiquidityConfig;
  const { yRange, historicalChartData, lastChartData, setHoverPrice } =
    chartConfig;

  return (
    <HistoricalPriceChart
      data={historicalChartData}
      annotations={
        fullRange
          ? [new Dec(yRange[0] * 1.05), new Dec(yRange[1] * 0.95)]
          : rangeWithCurrencyDecimals
      }
      domain={yRange}
      onPointerHover={setHoverPrice}
      onPointerOut={
        lastChartData ? () => setHoverPrice(lastChartData.close) : undefined
      }
    />
  );
});

/** Discrete lookback stops, in days, the lookback slider snaps to. Spans
 *  1 hour to 1 year. Hardcoded so the slider behaves predictably; the
 *  underlying 1-year historical fetch covers all windows. */
const LOOKBACK_DAYS_STOPS: number[] = [
  1 / 24, // 1h
  12 / 24, // 12h
  1, // 1d
  2,
  3,
  5,
  7, // default
  14,
  21,
  30,
  60,
  90,
  180,
  365, // 1y
];

const formatLookback = (days: number): string => {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  }
  if (days >= 365) return "1y";
  return `${Math.round(days)}d`;
};

const lookbackToIndex = (days: number): number => {
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < LOOKBACK_DAYS_STOPS.length; i++) {
    const diff = Math.abs(LOOKBACK_DAYS_STOPS[i] - days);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
};

/** Stops of the unified width slider, tightest to widest: statistical bands
 *  (mean ± kσ over the lookback window, with 0σ a tight scalp band), then
 *  buffers beyond the window's observed min/max (fractions of its span),
 *  then full range. There is no 0% buffer stop: 3σ covers ~99.7% of
 *  observations, so it already approximates the observed range and the
 *  ladder continues from small buffers. The seam is still approximate — σ
 *  bands center on the mean while buffers span the observed extremes, so on
 *  trending windows 3σ can be wider than a small buffer. Buffer increments
 *  are denser at the low end, where a step matters most. */
type WidthStop =
  | { kind: "sigma"; sigmas: number; label: string }
  | { kind: "buffer"; bufferFraction: number; label: string }
  | { kind: "max"; label: string };
const BUFFER_PERCENT_STOPS = [5, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500];
const WIDTH_STOPS: WidthStop[] = [
  ...[0, 1, 2, 3].map((k) => ({
    kind: "sigma" as const,
    sigmas: k,
    label: `${k}σ`,
  })),
  ...BUFFER_PERCENT_STOPS.map((pct) => ({
    kind: "buffer" as const,
    bufferFraction: pct / 100,
    label: `${pct}%`,
  })),
  { kind: "max" as const, label: "Max" },
];
/** 2σ: a moderate statistical band over the default 7d lookback. */
const DEFAULT_WIDTH_IDX = 2;

/** Persists only whether the user is in advanced mode — slider values
 *  themselves reset to their canonical defaults each time advanced opens. */
const ADV_LP_STORAGE_KEY = "osmosis.add-cl-liquidity.advanced-v1";

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    highSpotPriceInputRef: React.MutableRefObject<HTMLInputElement | null>;
    isInactivePool?: boolean;
    advancedEnabled: boolean;
    onAdvancedToggle: (next: boolean) => void;
  } & CustomClasses
> = observer((props) => {
  const { t } = useTranslation();
  const { currentStrategy } = props.addLiquidityConfig;

  // In advanced mode the description is binary (passive vs. sliders) so it
  // doesn't flicker during slider drags — the tickRange transiently lags
  // slidersTickRange while the apply is debounced, which would otherwise
  // make currentStrategy oscillate between "sliders" and null.
  let descriptionText: string;
  if (props.advancedEnabled) {
    descriptionText =
      currentStrategy === "passive"
        ? t("addConcentratedLiquidity.volatilityPassiveDescription")
        : t("addConcentratedLiquidity.volatilitySlidersDescription");
  } else if (currentStrategy === "passive") {
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
  } else {
    descriptionText = t("addConcentratedLiquidity.volatilityCustomDescription");
  }

  const exitAdvanced = useCallback(
    () => props.onAdvancedToggle(false),
    [props]
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-y-4 1.5md:flex-col">
        <div className="mx-4 flex flex-col gap-2">
          <span className="subtitle1">
            {t("addConcentratedLiquidity.selectVolatilityRange")}
          </span>
          <span className="caption text-osmoverse-200">{descriptionText}</span>
        </div>
        <div className="flex gap-2 1.5md:pl-4 sm:flex-col sm:pl-0">
          <PresetStrategyCard
            type={null}
            src="/images/custom-vial.svg"
            addLiquidityConfig={props.addLiquidityConfig}
            label="Custom"
            className="sm:order-4 sm:w-full"
            highSpotPriceInputRef={props.highSpotPriceInputRef}
            disabledForInactivePool={false}
            onBeforeClick={exitAdvanced}
            forceUnselected={props.advancedEnabled}
          />
          <div className="flex gap-2 xs:flex-wrap">
            <PresetStrategyCard
              type="passive"
              src="/images/small-vial.svg"
              addLiquidityConfig={props.addLiquidityConfig}
              label="Passive"
              className="sm:flex-1"
              disabledForInactivePool={false}
              onBeforeClick={exitAdvanced}
              forceUnselected={props.advancedEnabled}
            />
            <PresetStrategyCard
              type="moderate"
              src="/images/medium-vial.svg"
              addLiquidityConfig={props.addLiquidityConfig}
              label="Moderate"
              className="sm:flex-1"
              disabledForInactivePool={props.isInactivePool}
              onBeforeClick={exitAdvanced}
              forceUnselected={props.advancedEnabled}
            />
            <PresetStrategyCard
              type="aggressive"
              src="/images/large-vial.svg"
              addLiquidityConfig={props.addLiquidityConfig}
              label="Aggressive"
              className="sm:flex-1"
              disabledForInactivePool={props.isInactivePool}
              onBeforeClick={exitAdvanced}
              forceUnselected={props.advancedEnabled}
            />
            <AdvancedStrategyCard
              isSelected={props.advancedEnabled}
              disabled={Boolean(props.isInactivePool)}
              onClick={() => props.onAdvancedToggle(true)}
              className="sm:flex-1"
            />
          </div>
        </div>
      </div>

      {props.advancedEnabled && (
        <AdvancedRangeControls addLiquidityConfig={props.addLiquidityConfig} />
      )}
    </section>
  );
});

const AdvancedStrategyCard: FunctionComponent<
  {
    isSelected: boolean;
    disabled: boolean;
    onClick: () => void;
  } & CustomClasses
> = ({ isSelected, disabled, onClick, className }) => {
  const { t } = useTranslation();
  return (
    <div
      className={classNames(
        "flex w-[114px] items-center justify-center gap-2 rounded-2xl p-[2px]",
        {
          "cursor-pointer hover:bg-supercharged": !disabled,
          "bg-supercharged": isSelected && !disabled,
          "cursor-not-allowed opacity-40": disabled,
        },
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex h-full w-full flex-col rounded-2xlinset bg-osmoverse-700 p-3">
        <div
          className={classNames(
            "mx-auto mb-1.5 transform transition-transform",
            { "scale-110": isSelected }
          )}
        >
          <Image
            alt="advanced"
            src="/images/advanced-vial.png"
            width={60}
            height={60}
            className="h-[60px]"
          />
        </div>
        <span
          className={classNames("body2 text-center", {
            "text-osmoverse-200": !isSelected,
          })}
        >
          {t("addConcentratedLiquidity.advancedToggle")}
        </span>
      </div>
    </div>
  );
};

const AdvancedRangeControls: FunctionComponent<{
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
}> = observer((props) => {
  const { t } = useTranslation();
  const {
    setFullRange,
    setLookbackDays,
    setBufferFraction,
    lookbackDays,
    slidersPriceRange,
    historicalPrices,
    minHistoricalPrice,
    maxHistoricalPrice,
    setMinRange,
    setMaxRange,
    baseDepositAmountIn,
    quoteDepositAmountIn,
    rangeWithCurrencyDecimals,
    currentPriceWithDecimals,
    fullRange,
    allHistoricalPricesInDisplayUnits,
  } = props.addLiquidityConfig;
  const { logEvent } = useAmplitudeAnalytics();

  // Within a single modal session, user tweaks survive toggling Advanced
  // off and back on — only a fresh modal mount returns to the defaults
  // (7d lookback, 2σ width).

  const multiplicationQuoteOverBase = useMemo(
    () =>
      DecUtils.getTenExponentN(
        (baseDepositAmountIn.sendCurrency.coinDecimals ?? 0) -
          (quoteDepositAmountIn.sendCurrency.coinDecimals ?? 0)
      ),
    [baseDepositAmountIn.sendCurrency, quoteDepositAmountIn.sendCurrency]
  );

  const applySlidersRange = useCallback(() => {
    const [lo, hi] = slidersPriceRange;
    setFullRange(false);
    setMinRange(lo.mul(multiplicationQuoteOverBase).toString());
    setMaxRange(hi.mul(multiplicationQuoteOverBase).toString());
  }, [
    slidersPriceRange,
    setFullRange,
    setMinRange,
    setMaxRange,
    multiplicationQuoteOverBase,
  ]);

  // Unified width slider: sweeps from tight statistical bands (mean ± kσ over
  // the lookback window) through buffers beyond the window's observed range
  // (5%..500% of its span, denser steps at the low end) out to full range.
  // One control instead of separate σ presets and a buffer slider.
  const [widthIdx, setWidthIdx] = useState(DEFAULT_WIDTH_IDX);

  const applyWidthStop = useCallback(() => {
    const stop = WIDTH_STOPS[widthIdx];
    if (stop.kind === "max") {
      setFullRange(true);
      return;
    }
    if (stop.kind === "sigma") {
      const range = calcSigmaRange({
        prices: allHistoricalPricesInDisplayUnits,
        windowDays: lookbackDays,
        sigmas: stop.sigmas,
        nowMs: Date.now(),
      });
      setFullRange(false);
      if (!range) {
        // Window can't support the statistic (thin data / flat series):
        // fall back to the window's observed range (a plain 0% buffer).
        setBufferFraction(0);
        applySlidersRange();
        return;
      }
      // σ ranges are computed in display units, which is what
      // setMin/MaxRange expect; the buffer path multiplies out of the raw
      // strategy space instead (see applySlidersRange).
      setMinRange(range[0].toString());
      setMaxRange(range[1].toString());
      return;
    }
    setBufferFraction(stop.bufferFraction);
    applySlidersRange();
  }, [
    widthIdx,
    lookbackDays,
    allHistoricalPricesInDisplayUnits,
    setFullRange,
    setBufferFraction,
    setMinRange,
    setMaxRange,
    applySlidersRange,
  ]);

  // On first render of advanced controls, apply the sliders range so the
  // user sees their saved (or default) settings reflected immediately.
  const hasAppliedInitial = useRef(false);
  useEffect(() => {
    if (hasAppliedInitial.current) return;
    // Wait for either the long series or the legacy 7d min/max to load.
    const hasData =
      historicalPrices.length > 0 ||
      (minHistoricalPrice !== null && maxHistoricalPrice !== null);
    if (!hasData) return;
    applyWidthStop();
    hasAppliedInitial.current = true;
  }, [
    historicalPrices,
    minHistoricalPrice,
    maxHistoricalPrice,
    applyWidthStop,
  ]);

  // Re-apply when slider inputs OR the underlying data change. Debounced so
  // that dragging doesn't run the full deposit-recalc chain on every pixel.
  useEffect(() => {
    if (!hasAppliedInitial.current) return;
    const t = setTimeout(() => {
      applyWidthStop();
    }, 80);
    return () => clearTimeout(t);
    // applyWidthStop already captures the current observable state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookbackDays, widthIdx, historicalPrices.length]);

  const onLookbackChange = useCallback(
    (days: number) => {
      setLookbackDays(days);
      logEvent([
        EventName.ConcentratedLiquidity.strategyPicked,
        { strategy: `sliders-lookback-${formatLookback(days)}` },
      ]);
    },
    [setLookbackDays, logEvent]
  );

  const onWidthChange = useCallback(
    (idx: number) => {
      setWidthIdx(idx);
      logEvent([
        EventName.ConcentratedLiquidity.strategyPicked,
        { strategy: `sliders-width-${WIDTH_STOPS[idx].label}` },
      ]);
    },
    [logEvent]
  );

  // How concentrated the chosen range is versus full range, at current spot.
  const capitalEfficiency = useMemo(() => {
    if (fullRange) return new Dec(1);
    return calcCapitalEfficiency({
      lowerPrice: rangeWithCurrencyDecimals[0],
      upperPrice: rangeWithCurrencyDecimals[1],
      spotPrice: currentPriceWithDecimals,
    });
  }, [fullRange, rangeWithCurrencyDecimals, currentPriceWithDecimals]);

  const lookbackIdx = lookbackToIndex(lookbackDays);

  return (
    <div className="block w-full rounded-2xl bg-osmoverse-800 p-4">
      <div className="block w-full">
        <div className="mb-4 block w-full">
          <SliderRow
            label={t("addConcentratedLiquidity.lookbackLabel")}
            valueLabel={formatLookback(lookbackDays)}
          >
            <DetentSlider
              ariaLabel={t("addConcentratedLiquidity.lookbackLabel")}
              min={0}
              max={LOOKBACK_DAYS_STOPS.length - 1}
              value={lookbackIdx}
              detents={LOOKBACK_DAYS_STOPS.map((_, i) => i)}
              onChange={(idx) => onLookbackChange(LOOKBACK_DAYS_STOPS[idx])}
            />
          </SliderRow>
        </div>
        <div className="block w-full">
          <SliderRow
            label={t("addConcentratedLiquidity.widthLabel")}
            valueLabel={WIDTH_STOPS[widthIdx].label}
            help={t("addConcentratedLiquidity.widthHelp")}
          >
            <DetentSlider
              ariaLabel={t("addConcentratedLiquidity.widthLabel")}
              min={0}
              max={WIDTH_STOPS.length - 1}
              value={widthIdx}
              detents={WIDTH_STOPS.map((_, i) => i)}
              onChange={onWidthChange}
            />
          </SliderRow>
        </div>
        {capitalEfficiency && (
          <div className="mt-3 flex items-center justify-between">
            <span className="caption text-osmoverse-300">
              {t("addConcentratedLiquidity.capitalEfficiency")}
            </span>
            <span className="caption text-osmoverse-200">
              {t("addConcentratedLiquidity.capitalEfficiencyValue", {
                multiplier: Number(capitalEfficiency.toString()).toLocaleString(
                  "en-US",
                  { maximumFractionDigits: 1 }
                ),
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

const PresetStrategyCard: FunctionComponent<
  {
    type: null | "passive" | "moderate" | "aggressive";
    src: string;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    label: string;
    width?: number;
    height?: number;
    highSpotPriceInputRef?: React.MutableRefObject<HTMLInputElement | null>;
    disabledForInactivePool?: boolean;
    /** Fires before the card's preset is applied. Used by the parent to
     *  exit advanced mode when the user picks a legacy preset. */
    onBeforeClick?: () => void;
    /** When true, the card never appears selected even if its range matches
     *  the current strategy. Used while Advanced is active so the Advanced
     *  card is the only highlighted entry. */
    forceUnselected?: boolean;
  } & CustomClasses
> = observer(
  ({
    type,
    src,
    width,
    height,
    label,
    addLiquidityConfig,
    className,
    highSpotPriceInputRef,
    disabledForInactivePool,
    onBeforeClick,
    forceUnselected,
  }) => {
    const {
      currentStrategy,
      setFullRange,
      aggressivePriceRange,
      moderatePriceRange,
      initialCustomPriceRange,
      baseDepositAmountIn,
      quoteDepositAmountIn,
      setMinRange,
      setMaxRange,
    } = addLiquidityConfig;
    const { logEvent } = useAmplitudeAnalytics();

    const disabled = disabledForInactivePool === true;

    const isSelected = !forceUnselected && type === currentStrategy;

    const updateInputAndRangeMinMax = useCallback(
      (min: Dec, max: Dec) => {
        const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
          (baseDepositAmountIn.sendCurrency.coinDecimals ?? 0) -
            (quoteDepositAmountIn.sendCurrency.coinDecimals ?? 0)
        );

        setMinRange(min.mul(multiplicationQuoteOverBase).toString());
        setMaxRange(max.mul(multiplicationQuoteOverBase).toString());
      },
      [setMinRange, setMaxRange, baseDepositAmountIn, quoteDepositAmountIn]
    );

    const onClick = () => {
      onBeforeClick?.();
      if (type !== null)
        logEvent([
          EventName.ConcentratedLiquidity.strategyPicked,
          {
            strategy: type,
          },
        ]);
      switch (type) {
        case "passive":
          setFullRange(true);
          return;
        case "moderate":
          updateInputAndRangeMinMax(
            moderatePriceRange[0],
            moderatePriceRange[1]
          );
          return;
        case "aggressive":
          updateInputAndRangeMinMax(
            aggressivePriceRange[0],
            aggressivePriceRange[1]
          );
          return;
        case null: // custom
          updateInputAndRangeMinMax(
            initialCustomPriceRange[0],
            initialCustomPriceRange[1]
          );
          highSpotPriceInputRef?.current?.focus();
          return;
      }
    };

    // Pegged-currency hide: moderate range collapses onto aggressive.
    const disabledForPeggedCurrencies =
      "moderate" === type &&
      aggressivePriceRange[0].equals(moderatePriceRange[0]) &&
      aggressivePriceRange[1].equals(moderatePriceRange[1]);

    if (disabledForPeggedCurrencies) return null;

    return (
      <div
        className={classNames(
          "flex w-[114px] items-center justify-center gap-2 rounded-2xl p-[2px]",
          {
            "cursor-pointer hover:bg-supercharged": !disabled,
            "bg-supercharged": isSelected && !disabled,
            "cursor-not-allowed opacity-40": disabled,
          },
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        <div className="flex h-full w-full flex-col rounded-2xlinset bg-osmoverse-700 p-3">
          <div
            className={classNames(
              "mx-auto mb-1.5 transform transition-transform",
              {
                "scale-110": isSelected,
              }
            )}
          >
            <Image
              alt="volatility-selection"
              src={src}
              width={width || 60}
              height={height || 60}
              className={!height ? "h-[60px]" : ""}
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

const SliderRow: FunctionComponent<{
  /** Optional left-aligned label. Omit to drop the entire label row when
   *  neither a label nor a value display is needed. */
  label?: string;
  /** Optional right-aligned display: either a formatted string or a custom
   *  node (e.g., a typable input that drives the same value as the slider). */
  valueLabel?: ReactNode;
  help?: string;
  /** Number of evenly-spaced tick marks rendered under the slider (e.g. 14
   *  for the lookback stops, 11 for the buffer's 10% increments). Omit to
   *  render no ticks. */
  tickCount?: number;
  children: ReactNode;
}> = ({ label, valueLabel, help, tickCount, children }) => (
  <div className="w-full">
    {(label || valueLabel) && (
      <div className="flex items-center justify-between pb-2">
        {label ? (
          <span className="caption text-osmoverse-200">{label}</span>
        ) : (
          <span />
        )}
        {typeof valueLabel === "string" ? (
          <span className="text-sm text-osmoverse-100">{valueLabel}</span>
        ) : (
          valueLabel ?? null
        )}
      </div>
    )}
    {/* Plain block wrapper so the native range input's `width: 100%`
        resolves against a known full-width containing block. */}
    <div style={{ width: "100%", display: "block" }}>{children}</div>
    {tickCount && tickCount > 0 ? (
      // The slider thumb is 14px; its center sits at the track end, so the
      // active range starts 7px in from each edge. Match that inset on the
      // tick row so marks line up with thumb stops, not the input box.
      <div
        aria-hidden="true"
        className="pointer-events-none flex justify-between"
        style={{
          width: "100%",
          paddingLeft: 7,
          paddingRight: 7,
          marginTop: 4,
        }}
      >
        {Array.from({ length: tickCount }).map((_, i) => (
          <span key={i} className="block h-1.5 w-px bg-osmoverse-500" />
        ))}
      </div>
    ) : null}
    {help && (
      <span className="caption mt-1 block text-osmoverse-400">{help}</span>
    )}
  </div>
);

const BacktestPanel: FunctionComponent<{
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  /** Imperator-projected APR for the current tick range — the same RatePretty
   *  instance the chart's top-right "Estimated APR" displays. Lifted to the
   *  parent observer so the value flows in as a prop and updates here as
   *  soon as the chart's value updates. */
  rangeApr: RatePretty | undefined;
}> = observer(({ addLiquidityConfig, rangeApr }) => {
  const { t } = useTranslation();
  const {
    allHistoricalPricesInDisplayUnits,
    rangeWithCurrencyDecimals,
    fullRange,
    currentPriceWithDecimals,
  } = addLiquidityConfig;

  // The backtest's timescale is independent of the Advanced lookback slider.
  const [backtestLookbackDays, setBacktestLookbackDays] = useState(7);

  const lowerPrice = rangeWithCurrencyDecimals[0];
  const upperPrice = rangeWithCurrencyDecimals[1];

  // Time-in-range is computed locally from the historical price array
  // filtered by the user's chosen backtest window. The store hands us prices
  // already in display units so the comparison against
  // `rangeWithCurrencyDecimals` is unit-correct on pairs whose two sides
  // have different exponents.
  const { timeInRangeFraction, hasData, isFallback } = useMemo(() => {
    if (allHistoricalPricesInDisplayUnits.length === 0) {
      return {
        timeInRangeFraction: 0,
        hasData: false,
        isFallback: false,
      };
    }
    const cutoff = Date.now() - backtestLookbackDays * 86_400_000;
    let filtered = allHistoricalPricesInDisplayUnits.filter(
      (p) => p.time >= cutoff
    );
    // The 1-year price endpoint typically returns daily bars, so windows
    // shorter than the bar resolution (e.g. 1h, 12h) come back empty.
    // Fall back to the most recent two bars so we can still produce a
    // sample rather than showing dashes.
    const isFallback = filtered.length === 0;
    if (isFallback) {
      filtered = allHistoricalPricesInDisplayUnits.slice(-2);
    }
    if (filtered.length === 0) {
      return {
        timeInRangeFraction: 0,
        hasData: false,
        isFallback: false,
      };
    }
    let inCount = 0;
    for (let i = 0; i < filtered.length; i++) {
      const close = filtered[i].close;
      const inRange = fullRange
        ? true
        : close.gte(lowerPrice) && close.lte(upperPrice);
      if (inRange) inCount++;
    }
    return {
      timeInRangeFraction: inCount / filtered.length,
      hasData: true,
      isFallback,
    };
  }, [
    allHistoricalPricesInDisplayUnits,
    backtestLookbackDays,
    lowerPrice,
    upperPrice,
    fullRange,
  ]);

  // Scale the projected APR by historical time-in-range so the displayed
  // APR reflects what the position would actually have earned, not the
  // steady-state projection. Stay in Dec/RatePretty space so the formatting
  // matches the chart's top-right APR exactly when time-in-range is 100%.
  const backtestedApr = useMemo(() => {
    if (!rangeApr) return null;
    // Quantise the time-in-range fraction to 6 dp so the float-point string
    // is safe to feed into Dec's strict constructor.
    const fractionDec = new Dec(
      (Math.round(timeInRangeFraction * 1e6) / 1e6).toString()
    );
    return new RatePretty(rangeApr.toDec().mul(fractionDec));
  }, [rangeApr, timeInRangeFraction]);

  // Divergence (impermanent loss) versus holding the deposited tokens, for a
  // deposit at current spot evaluated at a few representative exit prices.
  // Fees and incentives excluded: this isolates the cost side the backtest
  // APR does not capture.
  const ilScenarios = useMemo(() => {
    const spot = currentPriceWithDecimals;
    const [lowerPrice, upperPrice] = rangeWithCurrencyDecimals;
    if (fullRange || !spot.isPositive()) return [];
    const scenario = (
      labelKey: string,
      labelParams: Record<string, string>,
      exitPrice: Dec
    ) => {
      const result = calcPositionValueVsHold({
        lowerPrice,
        upperPrice,
        entryPrice: spot,
        exitPrice,
      });
      return result
        ? { labelKey, labelParams, delta: result.deltaVsHold }
        : undefined;
    };
    return [
      scenario("addConcentratedLiquidity.ilAtRangeFloor", {}, lowerPrice),
      scenario(
        "addConcentratedLiquidity.ilSpotMove",
        { percent: "-10%" },
        spot.mul(new Dec("0.9"))
      ),
      scenario(
        "addConcentratedLiquidity.ilSpotMove",
        { percent: "+10%" },
        spot.mul(new Dec("1.1"))
      ),
      scenario("addConcentratedLiquidity.ilAtRangeCeiling", {}, upperPrice),
    ].filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [currentPriceWithDecimals, rangeWithCurrencyDecimals, fullRange]);

  const lookbackIdx = lookbackToIndex(backtestLookbackDays);
  const windowLabel = formatLookback(backtestLookbackDays);

  return (
    <>
      <section className="flex w-full flex-col gap-3 rounded-2xl bg-osmoverse-800 p-4">
        <div className="flex items-center justify-between">
          <span className="subtitle1">
            {t("addConcentratedLiquidity.backtestTitle", {
              window: windowLabel,
            })}
          </span>
          {isFallback && (
            <span className="caption text-osmoverse-400">
              (using latest available bars — window shorter than data
              resolution)
            </span>
          )}
        </div>
        <SliderRow>
          <DetentSlider
            ariaLabel={t("addConcentratedLiquidity.lookbackLabel")}
            min={0}
            max={LOOKBACK_DAYS_STOPS.length - 1}
            value={lookbackIdx}
            detents={LOOKBACK_DAYS_STOPS.map((_, i) => i)}
            onChange={(idx) =>
              setBacktestLookbackDays(LOOKBACK_DAYS_STOPS[idx])
            }
          />
        </SliderRow>
        <div className="grid grid-cols-2 gap-4">
          <BacktestStat
            label={t("addConcentratedLiquidity.backtestTimeInRange")}
            value={hasData ? `${(timeInRangeFraction * 100).toFixed(0)}%` : "—"}
          />
          <BacktestStat
            label={t("addConcentratedLiquidity.backtestApr")}
            value={
              backtestedApr === null
                ? "—"
                : backtestedApr.maxDecimals(1).toString()
            }
          />
        </div>
        <span className="caption text-osmoverse-400">
          {t("addConcentratedLiquidity.backtestDisclaimer")}
        </span>
      </section>
      {ilScenarios.length > 0 && (
        <section className="flex w-full flex-col gap-3 rounded-2xl bg-osmoverse-800 p-4">
          <span className="subtitle1">
            {t("addConcentratedLiquidity.ilTitle")}
          </span>
          <div className="grid grid-cols-2 gap-x-4">
            {ilScenarios.map(({ labelKey, labelParams, delta }) => (
              <div
                key={labelKey + (labelParams.percent ?? "")}
                className="flex items-center justify-between"
              >
                <span className="caption text-osmoverse-400">
                  {t(labelKey, labelParams)}
                </span>
                <span
                  className={classNames(
                    "caption",
                    delta.lt(new Dec("-0.0005"))
                      ? "text-rust-300"
                      : "text-osmoverse-200"
                  )}
                >
                  {formatPretty(new RatePretty(delta), { maxDecimals: 2 })}
                </span>
              </div>
            ))}
          </div>
          <span className="caption text-osmoverse-400">
            {t("addConcentratedLiquidity.ilDisclaimer")}
          </span>
        </section>
      )}
    </>
  );
});

const BacktestStat: FunctionComponent<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1">
    <span className="caption text-osmoverse-300">{label}</span>
    <span className="text-h6 text-white-full">{value}</span>
  </div>
);

const PriceInputBox: FunctionComponent<{
  label: string;
  forPriceIndex: 0 | 1;
  addConcLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  /** Fired on every user keystroke. Used by the parent to flip selection
   *  back to Custom when the user manually edits the high/low price. */
  onManualEdit?: () => void;
}> = observer(
  ({
    label,
    forPriceIndex,
    addConcLiquidityConfig,
    inputRef,
    onManualEdit,
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    const isFullRange =
      forPriceIndex === 1 && addConcLiquidityConfig.fullRange && !isFocused;

    /** to allow decimals, display the raw string value while typing
   otherwise, display the nearest tick rounded price.
    All values have currency decimals adjusted for display. */
    const currentValue = isFocused
      ? addConcLiquidityConfig.rangeRaw[forPriceIndex]
      : formatPretty(
          addConcLiquidityConfig.rangeWithCurrencyDecimals[forPriceIndex],
          {
            maxDecimals: 8,
          }
        );

    return (
      <div className="flex w-full max-w-[9.75rem] flex-col items-end overflow-clip rounded-xl bg-osmoverse-800 px-2 focus-within:bg-osmoverse-900">
        <span className="caption px-2 pt-2 text-osmoverse-400">{label}</span>
        {isFullRange ? (
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
            className="bg-transparent text-subtitle1 leading-tight"
            style="no-border"
            type="text"
            inputMode="decimal"
            rightEntry
            inputRef={inputRef}
            autoFocus={
              forPriceIndex === 1 &&
              !isFullRange &&
              addConcLiquidityConfig.currentStrategy === null
            }
            currentValue={currentValue}
            onFocus={() => setIsFocused(true)}
            onInput={(val) => {
              onManualEdit?.();
              if (forPriceIndex === 0) {
                addConcLiquidityConfig.setMinRange(val);
              } else {
                addConcLiquidityConfig.setMaxRange(val);
              }
            }}
            onBlur={() => setIsFocused(false)}
          />
        )}
      </div>
    );
  }
);
