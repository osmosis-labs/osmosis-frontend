import {
  calcCapitalEfficiency,
  calcPositionValueVsHold,
} from "@osmosis-labs/math";
import type { Pool } from "@osmosis-labs/server";
import { Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import debounce from "debounce";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  FunctionComponent,
  memo,
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
import {
  AddConcentratedLiquidityConfig,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import {
  type HistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
  useHoverPrice,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { useLocalStorageState } from "~/hooks/window/use-localstorage-state";
import { calcSigmaRange, calcWindowStats } from "~/utils/cl-sigma-range";
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
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    onRequestClose: () => void;
  } & CustomClasses
> = memo(({ className, addLiquidityConfig, actionButton }) => {
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
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    actionButton: ReactNode;
    isInactivePool?: boolean;
  } & CustomClasses
> = memo(({ addLiquidityConfig, actionButton, pool, isInactivePool }) => {
  const { isMobile } = useWindowSize();
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
  // useLocalStorageState renders the initial value until hydrated, so the
  // toggle starts off on the server and picks up the stored value after.
  const advancedEnabled = persistedAdvanced?.enabled === true;
  const setAdvancedEnabled = useCallback(
    (next: boolean) => {
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

  const chartConfig = useHistoricalAndLiquidityData(poolId);

  // Default to passive strategy for inactive pools (only on mount)
  useEffect(() => {
    if (isInactivePool && !fullRange && !hasInitializedInactivePool.current) {
      setFullRange(true);
      hasInitializedInactivePool.current = true;
    }
  }, [isInactivePool, fullRange, setFullRange]);

  const { data: superfluidPoolIds } =
    api.edge.pools.getSuperfluidPoolIds.useQuery();
  const isSuperfluidPool = Boolean(superfluidPoolIds?.includes(poolId));
  const { data: superfluidApr } = api.edge.pools.getSuperfluidPoolApr.useQuery(
    { poolId },
    { enabled: isSuperfluidPool }
  );
  const { data: stakingParams } = api.edge.staking.getStakingParams.useQuery(
    undefined,
    { enabled: isSuperfluidPool }
  );

  const { yRange, xRange, depthChartData, setPriceRange } = chartConfig;

  const sfStakingDisabled = !fullRange || Boolean(addLiqError);

  // the full range tick range is already [minTick, maxTick]
  const { data: currentRangeApr, isFetching: isRangeAprFetching } =
    api.edge.pools.getPriceRangeApr.useQuery({
      poolId,
      lowerTickIndex: Number(tickRange[0].toString()),
      upperTickIndex: Number(tickRange[1].toString()),
    });
  // sync the price range of the add liq config and the chart config
  // sync the initial hover price
  // TODO: this is a code smell. the chart config should observe the add liq config
  //        this may be acieved by using an interface
  useEffect(() => {
    setPriceRange(rangeWithCurrencyDecimals);
  }, [setPriceRange, rangeWithCurrencyDecimals]);

  // Rendered inside the depth chart box on desktop and in the price header row
  // on phones, where they leave the charts more height.
  const zoomButtons = (
    <>
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
    </>
  );

  // Moving the lookback always retunes the price chart to the smallest
  // preset that encloses the window (exact at the 1h/1d/7d/1mo stops).
  // One-directional by design: the chart's own timeframe buttons never
  // write back to the lookback, and they stick until the lookback next
  // moves (historicalRange is deliberately not a dependency).
  const advancedLookbackDays = addLiquidityConfig.lookbackDays;
  useEffect(() => {
    if (!advancedEnabled) return;
    const target =
      advancedLookbackDays <= 1 / 24
        ? "1h"
        : advancedLookbackDays <= 1
          ? "1d"
          : advancedLookbackDays <= 7
            ? "7d"
            : advancedLookbackDays <= 30
              ? "1mo"
              : "1y";
    if (chartConfig.historicalRange !== target)
      chartConfig.setHistoricalRange(target);
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
        {/* Phones: the price header and the zoom buttons get their own
            full-width row above the charts, so neither pushes a plot down.
            Both charts then start 16px from the top and end 52px from the
            bottom, so the two price scales line up. */}
        <div className="hidden items-end gap-2 px-4 pb-3 md:flex">
          <div className="min-w-0 flex-1">
            {!chartConfig.isHistoricalDataLoading &&
              !chartConfig.historicalChartUnavailable && (
                <ChartHeader
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
              )}
          </div>
          <div className="flex h-6 shrink-0 gap-1">{zoomButtons}</div>
        </div>
        {/* Phones: no gap, so the price and depth charts read as one chart
            rather than being split by a line of the modal background. */}
        <div className="flex w-full gap-1 md:gap-0">
          <div className="flex h-[20.1875rem] flex-grow flex-col gap-[20px] rounded-l-2xl bg-osmoverse-700 py-7 pl-6 md:min-w-0 md:gap-0 md:pb-7 md:pl-3 md:pt-4">
            {chartConfig.isHistoricalDataLoading ? (
              <Spinner className="m-auto" />
            ) : chartConfig.historicalChartUnavailable ? (
              <ChartUnavailable />
            ) : (
              <>
                <div className="md:hidden">
                  <ChartHeader
                    chartConfig={chartConfig}
                    addLiquidityConfig={addLiquidityConfig}
                  />
                </div>
                <Chart
                  chartConfig={chartConfig}
                  addLiquidityConfig={addLiquidityConfig}
                />
              </>
            )}
          </div>
          {/* Phones: the price history stays beside this box, so the depth
              chart narrows to about a fifth of the row and the range inputs
              narrow too. */}
          <div className="relative flex h-[20.1875rem] w-96 rounded-r-2xl bg-osmoverse-700 md:w-auto md:shrink-0">
            <div className="flex flex-1 flex-col md:w-[20vw] md:flex-none md:pt-4">
              <div className="mb-8 mr-6 mt-7 flex h-6 justify-end gap-1 md:hidden">
                {zoomButtons}
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
                onMoveMax={useMemo(
                  () =>
                    debounce((num: number) => {
                      onManualPriceEdit();
                      setMaxRange(num.toString());
                    }, 250),
                  [onManualPriceEdit, setMaxRange]
                )}
                onMoveMin={useMemo(
                  () =>
                    debounce((num: number) => {
                      onManualPriceEdit();
                      setMinRange(num.toString());
                    }, 250),
                  [onManualPriceEdit, setMinRange]
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
                // The right margin leaves room for the drag handles; on phones
                // they need far less than desktop's 36px, and the space goes
                // to the narrow depth chart instead.
                offset={{
                  top: 0,
                  right: isMobile ? 12 : 36,
                  bottom: 24 + 28,
                  left: 0,
                }}
                horizontal
                fullRange={fullRange}
              />
              {currentRangeApr && (
                <div className="absolute right-8 top-5 flex select-none flex-col text-right md:right-3 md:top-3">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-osmoverse-300 md:text-caption">
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
                  {isRangeAprFetching ? (
                    <Spinner className="m-auto mt-1.5" />
                  ) : (
                    <h5 className="text-osmoverse-100 md:text-h6 md:font-h6">
                      {currentRangeApr.maxDecimals(1).toString() ?? ""}{" "}
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
          rangeApr={currentRangeApr ?? undefined}
        />
      )}
      <section className="flex flex-col">
        <div className="subtitle1 flex place-content-between items-baseline px-4 pb-3">
          {t("addConcentratedLiquidity.amountToDeposit")}
          {isSuperfluidPool && (
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
                  {superfluidApr?.toDec().isPositive()
                    ? `(+${superfluidApr.maxDecimals(0)} APR)`
                    : undefined}
                </h6>
                {stakingParams && (
                  <span className="caption text-osmoverse-300">
                    {t("lockToken.bondingRequirement", {
                      numDays: (
                        stakingParams.unbondingTimeSeconds /
                        (24 * 60 * 60)
                      ).toString(),
                    })}
                  </span>
                )}
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
  chartConfig: HistoricalAndLiquidityData;

  addLiquidityConfig: AddConcentratedLiquidityConfig;
}> = memo(({ addLiquidityConfig, chartConfig }) => {
  const { baseDepositAmountIn, quoteDepositAmountIn } = addLiquidityConfig;
  const { historicalRange, setHistoricalRange, priceDecimal } = chartConfig;
  const hoverPrice = useHoverPrice(chartConfig);

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
      // Phones: the price on top and the date-range buttons below,
      // left-aligned, on the same row as the zoom buttons.
      classes={{
        pricesHeaderRootContainer: "md:flex-col",
        buttons: "md:justify-start md:pr-0",
      }}
    />
  );
});

/**
 * Create a nested component to prevent unnecessary re-renders whenever the hover price changes.
 */
const Chart: FunctionComponent<{
  chartConfig: HistoricalAndLiquidityData;
  addLiquidityConfig: AddConcentratedLiquidityConfig;
}> = memo(({ addLiquidityConfig, chartConfig }) => {
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

/** σ width slider moves in volatility-coverage space: the value is the share
 *  of the window's volatility the band covers (per-mille, 0 → 99.9%), mapped
 *  to standard deviations through the normal-coverage anchors 1σ = 68%,
 *  2σ = 95%, 3σ = 99.7%, and 3.09σ = 99.9% — the slider's max. Detent dots
 *  sit at those anchors, proportional to coverage rather than evenly spaced
 *  in σ, so they bunch toward the top the way the distribution does. The
 *  band widens beyond the selected center; σ always comes from the lookback
 *  window. 0 coverage on a point center is a tight scalp band. */
const SIGMA_COVERAGE_ANCHORS: [perMille: number, sigmas: number][] = [
  [0, 0],
  [680, 1],
  [950, 2],
  [997, 3],
  [999, 3.09],
];
const SIGMA_SLIDER_MAX = 999;
/** Dots skip the 3σ anchor: it sits ~1px from the max, so a dot and label
 *  there would just read as a doubled endpoint. The coverage → σ mapping
 *  still passes through it. */
const SIGMA_DETENTS = [0, 680, 950, SIGMA_SLIDER_MAX];
/** Piecewise-linear coverage → σ through the anchors above. */
const sigmaFromCoverage = (perMille: number): number => {
  for (let i = 1; i < SIGMA_COVERAGE_ANCHORS.length; i++) {
    const [hiCov, hiSig] = SIGMA_COVERAGE_ANCHORS[i];
    if (perMille <= hiCov) {
      const [loCov, loSig] = SIGMA_COVERAGE_ANCHORS[i - 1];
      return loSig + ((perMille - loCov) / (hiCov - loCov)) * (hiSig - loSig);
    }
  }
  return SIGMA_COVERAGE_ANCHORS[SIGMA_COVERAGE_ANCHORS.length - 1][1];
};
const sigmaDetentLabel = (perMille: number): string | undefined => {
  if (perMille === 0) return "0σ";
  if (perMille === 680) return "1σ";
  if (perMille === 950) return "2σ";
  if (perMille === SIGMA_SLIDER_MAX) return "3.09σ";
  return undefined;
};

/** % width slider: ratio-symmetric buffer around the selected center —
 *  upper = center × (1 + x), lower = center ÷ (1 + x) — which is ≈ ±x% for
 *  small x but stays meaningful past 100% (a plain ±x% lower bound goes
 *  non-positive there) and is symmetric in price ratio, matching how CL
 *  ranges are geometric in tick space. The slider bottoms out at a true 0%
 *  (exactly the anchor: the observed range on the Range center, a tight
 *  scalp band on point centers), ramps linearly to the first landmark at
 *  0.5%, and is logarithmic from there to 500%. Dots are landmarks on a
 *  1-2-5 series, not snap points. */
const PERCENT_MIN = 0.5;
const PERCENT_MAX = 500;
const PERCENT_POSITIONS_PER_DECADE = 100;
/** Positions below this ramp linearly 0% → PERCENT_MIN; the log scale
 *  starts above it. */
const PERCENT_ZERO_SEGMENT = 30;
const PERCENT_POS_MAX =
  PERCENT_ZERO_SEGMENT +
  Math.round(
    Math.log10(PERCENT_MAX / PERCENT_MIN) * PERCENT_POSITIONS_PER_DECADE
  );
const percentFromPos = (pos: number): number =>
  pos <= 0
    ? 0
    : pos < PERCENT_ZERO_SEGMENT
      ? (pos / PERCENT_ZERO_SEGMENT) * PERCENT_MIN
      : PERCENT_MIN *
        Math.pow(
          10,
          (pos - PERCENT_ZERO_SEGMENT) / PERCENT_POSITIONS_PER_DECADE
        );
const posFromPercent = (percent: number): number =>
  percent <= 0
    ? 0
    : percent < PERCENT_MIN
      ? Math.round((percent / PERCENT_MIN) * PERCENT_ZERO_SEGMENT)
      : PERCENT_ZERO_SEGMENT +
        Math.round(
          Math.log10(Math.min(percent, PERCENT_MAX) / PERCENT_MIN) *
            PERCENT_POSITIONS_PER_DECADE
        );
/** Landmark dots: 0 plus a 1-2-5 series. */
const PERCENT_DOT_STOPS = [0, 0.5, 1, 5, 10, 20, 50, 100, 200, 500];
const formatPercentStop = (percent: number): string =>
  percent > 0 && percent < 1
    ? percent.toFixed(1)
    : percent < 10
      ? (Math.round(percent * 10) / 10).toString()
      : Math.round(percent).toString();
const percentDetentLabel = (pos: number): string | undefined => {
  if (pos === 0) return "0%";
  const percent = percentFromPos(pos);
  for (const stop of PERCENT_DOT_STOPS) {
    if (stop > 0 && Math.abs(percent - stop) / stop < 0.02)
      return `${formatPercentStop(stop)}%`;
  }
  return undefined;
};

/** Every lookback stop carries its label under the dot. */
const lookbackDetentLabel = (idx: number): string | undefined =>
  formatLookback(LOOKBACK_DAYS_STOPS[idx]);

/** 95% coverage (2σ): a moderate band over the default 7d lookback. */
const DEFAULT_SIGMA_COVERAGE = 950;
const DEFAULT_PERCENT = 25;

/** Persists only whether the user is in advanced mode — slider values
 *  themselves reset to their canonical defaults each time advanced opens. */
const ADV_LP_STORAGE_KEY = "osmosis.add-cl-liquidity.advanced-v1";

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    highSpotPriceInputRef: React.MutableRefObject<HTMLInputElement | null>;
    isInactivePool?: boolean;
    advancedEnabled: boolean;
    onAdvancedToggle: (next: boolean) => void;
  } & CustomClasses
> = memo((props) => {
  const { t } = useTranslation();
  const { currentStrategy } = props.addLiquidityConfig;

  // In advanced mode the description is binary (passive vs. sliders) so it
  // doesn't flicker during slider drags — the applied tickRange transiently
  // lags the controls while the apply is debounced.
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
  addLiquidityConfig: AddConcentratedLiquidityConfig;
}> = memo((props) => {
  const { t } = useTranslation();
  const {
    setFullRange,
    setLookbackDays,
    lookbackDays,
    historicalPrices,
    minHistoricalPrice,
    maxHistoricalPrice,
    setMinRange,
    setMaxRange,
    rangeWithCurrencyDecimals,
    currentPriceWithDecimals,
    fullRange,
    allHistoricalPricesInDisplayUnits,
  } = props.addLiquidityConfig;
  // Within a single modal session, user tweaks survive toggling Advanced
  // off and back on — only a fresh modal mount returns to the defaults
  // (7d lookback, 2σ beyond the observed range).

  // The range is a width applied beyond an explicit center: the lookback
  // window's observed [min, max] (an interval), its mean, or spot (points).
  // Width comes from whichever of the two sliders was touched last (the
  // inactive one dims): volatility coverage (mapped to standard deviations
  // of the window), or a ratio-symmetric % buffer.
  const [center, setCenter] = useState<"range" | "mean" | "spot">("range");
  const [widthMode, setWidthMode] = useState<"sigma" | "percent">("sigma");
  const [sigmaCoverage, setSigmaCoverage] = useState(DEFAULT_SIGMA_COVERAGE);
  const [percent, setPercent] = useState(DEFAULT_PERCENT);

  /** The lookback window's mean and observed extremes in display units,
   *  when computable. */
  const [nowMs] = useState(() => Date.now());
  const windowInfo = useMemo(() => {
    const stats = calcWindowStats({
      prices: allHistoricalPricesInDisplayUnits,
      windowDays: lookbackDays,
      nowMs,
    });
    if (stats.count < 10 || stats.mean <= 0 || stats.min <= 0) return undefined;
    return {
      mean: new Dec(stats.mean.toFixed(12)),
      min: new Dec(stats.min.toFixed(12)),
      max: new Dec(stats.max.toFixed(12)),
    };
  }, [allHistoricalPricesInDisplayUnits, lookbackDays, nowMs]);

  const applyAdvancedRange = useCallback(() => {
    // Effective anchor: the selected center when computable, otherwise spot
    // (the quiet stand-in while the series loads). Range and mean are
    // window statistics; spot needs no history.
    const anchor: [Dec, Dec] =
      center === "range" && windowInfo !== undefined
        ? [windowInfo.min, windowInfo.max]
        : center === "mean" && windowInfo !== undefined
          ? [windowInfo.mean, windowInfo.mean]
          : [currentPriceWithDecimals, currentPriceWithDecimals];
    if (!anchor[0].isPositive()) return;
    setFullRange(false);

    // All paths produce display units, which is what setMin/MaxRange expect.
    const applyPercentBeyond = (percent: number) => {
      // 0% on a point center would be a zero-width range; fall back to the
      // same tight scalp band as 0 coverage. On the Range center, 0% is
      // exactly the observed range.
      const isPointAnchor = anchor[0].equals(anchor[1]);
      const effectivePercent = isPointAnchor
        ? Math.max(percent, 0.25)
        : percent;
      const factor = new Dec((1 + effectivePercent / 100).toFixed(12));
      setMinRange(anchor[0].quo(factor).toString());
      setMaxRange(anchor[1].mul(factor).toString());
    };

    if (widthMode === "sigma") {
      const range = calcSigmaRange({
        prices: allHistoricalPricesInDisplayUnits,
        windowDays: lookbackDays,
        sigmas: sigmaFromCoverage(sigmaCoverage),
        nowMs: Date.now(),
        anchor,
      });
      if (!range) {
        // Window can't support the statistic (thin data / flat series, or a
        // band so wide its floor goes non-positive): fall back to a moderate
        // ±25%-equivalent buffer beyond the anchor.
        applyPercentBeyond(25);
        return;
      }
      setMinRange(range[0].toString());
      setMaxRange(range[1].toString());
      return;
    }
    applyPercentBeyond(percent);
  }, [
    widthMode,
    sigmaCoverage,
    percent,
    center,
    windowInfo,
    currentPriceWithDecimals,
    lookbackDays,
    allHistoricalPricesInDisplayUnits,
    setFullRange,
    setMinRange,
    setMaxRange,
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
    applyAdvancedRange();
    hasAppliedInitial.current = true;
  }, [
    historicalPrices,
    minHistoricalPrice,
    maxHistoricalPrice,
    applyAdvancedRange,
  ]);

  // Re-apply when control inputs OR the underlying data change. Debounced so
  // that dragging doesn't run the full deposit-recalc chain on every pixel.
  useEffect(() => {
    if (!hasAppliedInitial.current) return;
    const t = setTimeout(() => {
      applyAdvancedRange();
    }, 80);
    return () => clearTimeout(t);
    // applyAdvancedRange already captures the current observable state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lookbackDays,
    widthMode,
    sigmaCoverage,
    percent,
    center,
    historicalPrices.length,
  ]);

  const onCenterChange = useCallback((next: "range" | "mean" | "spot") => {
    setCenter(next);
  }, []);

  // Touching a width slider makes it the active width control ("last
  // touched wins"); the other stays at its position but dims.
  const onSigmaChange = useCallback((perMille: number) => {
    setWidthMode("sigma");
    setSigmaCoverage(perMille);
  }, []);

  const onPercentChange = useCallback((pos: number) => {
    setWidthMode("percent");
    setPercent(percentFromPos(pos));
  }, []);

  /** Deliberate keyboard entry beside each width slider; also makes the
   *  edited slider the active width control. */
  const onSigmaEntry = useCallback((value: number) => {
    setWidthMode("sigma");
    const perMille = Math.min(999, Math.max(0, Math.round(value * 10)));
    setSigmaCoverage(perMille);
  }, []);
  const onPercentEntry = useCallback((value: number) => {
    setWidthMode("percent");
    const clamped = Math.min(PERCENT_MAX, Math.max(0, value));
    setPercent(clamped);
  }, []);

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

  const formatCenterPrice = (price: Dec | undefined) =>
    price !== undefined && price.isPositive()
      ? formatPretty(price, getPriceExtendedFormatOptions(price))
      : "–";

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
              detentLabel={lookbackDetentLabel}
              onChange={(idx) => setLookbackDays(LOOKBACK_DAYS_STOPS[idx])}
            />
          </SliderRow>
        </div>
        <div className="mb-4 flex items-center justify-between gap-2 xs:flex-wrap">
          <span className="caption text-osmoverse-200">
            {t("addConcentratedLiquidity.centerLabel")}
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            <CenterChip
              label={`${t("addConcentratedLiquidity.centerRange")} ${
                windowInfo !== undefined
                  ? `${formatCenterPrice(windowInfo.min)}–${formatCenterPrice(
                      windowInfo.max
                    )}`
                  : "–"
              }`}
              selected={center === "range"}
              onClick={() => onCenterChange("range")}
            />
            <CenterChip
              label={`${t(
                "addConcentratedLiquidity.centerMean"
              )} ${formatCenterPrice(windowInfo?.mean)}`}
              selected={center === "mean"}
              onClick={() => onCenterChange("mean")}
            />
            <CenterChip
              label={`${t(
                "addConcentratedLiquidity.centerSpot"
              )} ${formatCenterPrice(currentPriceWithDecimals)}`}
              selected={center === "spot"}
              onClick={() => onCenterChange("spot")}
            />
          </div>
        </div>
        <div
          className={classNames(
            "mb-4 block w-full transition-opacity",
            widthMode !== "sigma" && "opacity-40"
          )}
        >
          <SliderRow
            label={t("addConcentratedLiquidity.stdDevLabel")}
            valueLabel={
              <PercentEntry
                value={(sigmaCoverage / 10).toFixed(1)}
                onCommit={onSigmaEntry}
                ariaLabel={t("addConcentratedLiquidity.stdDevLabel")}
              />
            }
            help={t("addConcentratedLiquidity.stdDevHelp")}
          >
            <DetentSlider
              ariaLabel={t("addConcentratedLiquidity.stdDevLabel")}
              min={0}
              max={SIGMA_SLIDER_MAX}
              value={sigmaCoverage}
              detents={SIGMA_DETENTS}
              detentLabel={sigmaDetentLabel}
              onChange={onSigmaChange}
            />
          </SliderRow>
        </div>
        <div
          className={classNames(
            "block w-full transition-opacity",
            widthMode !== "percent" && "opacity-40"
          )}
        >
          <SliderRow
            label={t("addConcentratedLiquidity.aroundCenterLabel")}
            valueLabel={
              <PercentEntry
                value={formatPercentStop(percent)}
                onCommit={onPercentEntry}
                ariaLabel={t("addConcentratedLiquidity.aroundCenterLabel")}
              />
            }
            help={t("addConcentratedLiquidity.aroundCenterHelp")}
          >
            <DetentSlider
              ariaLabel={t("addConcentratedLiquidity.aroundCenterLabel")}
              min={0}
              max={PERCENT_POS_MAX}
              value={posFromPercent(percent)}
              detents={PERCENT_DOT_STOPS.map(posFromPercent)}
              detentLabel={percentDetentLabel}
              onChange={onPercentChange}
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
    addLiquidityConfig: AddConcentratedLiquidityConfig;
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
> = memo(
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
    /** Disabled for inactive pools (to force passive and custom strategies only). */
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

/** Compact right-aligned percent entry that mirrors a slider's value and
 *  commits deliberate keyboard entries on blur or Enter. While focused it
 *  holds a local draft so the slider's live value doesn't fight the user's
 *  typing. */
const PercentEntry: FunctionComponent<{
  /** Formatted display value while not editing (without the % sign). */
  value: string;
  onCommit: (parsed: number) => void;
  ariaLabel: string;
}> = ({ value, onCommit, ariaLabel }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-0.5 text-sm text-osmoverse-100">
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        className="w-14 rounded-lg bg-osmoverse-900 px-2 py-0.5 text-right outline-none transition-colors focus:bg-osmoverse-1000"
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setDraft(value)}
        onBlur={() => {
          if (draft !== null) {
            const parsed = Number(draft);
            if (Number.isFinite(parsed)) onCommit(parsed);
          }
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      <span>%</span>
    </div>
  );
};

/** Pill option for the range-center toggle. The selected state uses the
 *  same accent as the sliders' fill so the active choice reads at a glance
 *  against the panel background. */
const CenterChip: FunctionComponent<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    className={classNames(
      "caption rounded-full px-3 py-1 transition-colors",
      selected
        ? "bg-wosmongton-500 text-white-full"
        : "bg-osmoverse-700 text-osmoverse-300 hover:bg-osmoverse-600"
    )}
    onClick={onClick}
  >
    {label}
  </button>
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
          (valueLabel ?? null)
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
  addLiquidityConfig: AddConcentratedLiquidityConfig;
  /** Imperator-projected APR for the current tick range — the same RatePretty
   *  instance the chart's top-right "Estimated APR" displays. Lifted to the
   *  parent so the value flows in as a prop and updates here as
   *  soon as the chart's value updates. */
  rangeApr: RatePretty | undefined;
}> = memo(({ addLiquidityConfig, rangeApr }) => {
  const { t } = useTranslation();
  const {
    allHistoricalPricesInDisplayUnits,
    rangeWithCurrencyDecimals,
    fullRange,
    currentPriceWithDecimals,
  } = addLiquidityConfig;

  // The backtest's timescale is independent of the Advanced lookback slider.
  const [backtestLookbackDays, setBacktestLookbackDays] = useState(7);
  const [nowMs] = useState(() => Date.now());

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
    const cutoff = nowMs - backtestLookbackDays * 86_400_000;
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
    nowMs,
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
  // APR does not capture. Grouped in columns: range edges, ±10%, ±20%.
  const ilColumns = useMemo(() => {
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
    const spotMove = (percentLabel: string, factor: string) =>
      scenario(
        "addConcentratedLiquidity.ilSpotMove",
        { percent: percentLabel },
        spot.mul(new Dec(factor))
      );
    return [
      [
        scenario("addConcentratedLiquidity.ilAtRangeFloor", {}, lowerPrice),
        scenario("addConcentratedLiquidity.ilAtRangeCeiling", {}, upperPrice),
      ],
      [spotMove("-10%", "0.9"), spotMove("+10%", "1.1")],
      [spotMove("-20%", "0.8"), spotMove("+20%", "1.2")],
    ]
      .map((column) =>
        column.filter((row): row is NonNullable<typeof row> => Boolean(row))
      )
      .filter((column) => column.length > 0);
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
            detentLabel={lookbackDetentLabel}
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
      {ilColumns.length > 0 && (
        <section className="flex w-full flex-col gap-3 rounded-2xl bg-osmoverse-800 p-4">
          <span className="subtitle1">
            {t("addConcentratedLiquidity.ilTitle")}
          </span>
          <div className="grid grid-cols-3 gap-x-6 sm:grid-cols-1 sm:gap-y-1">
            {ilColumns.map((column, columnIdx) => (
              <div key={columnIdx} className="flex flex-col gap-1">
                {column.map(({ labelKey, labelParams, delta }) => (
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
  addConcLiquidityConfig: AddConcentratedLiquidityConfig;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  /** Fired on every user keystroke. Used by the parent to flip selection
   *  back to Custom when the user manually edits the high/low price. */
  onManualEdit?: () => void;
}> = memo(
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
      <div className="flex w-full max-w-[9.75rem] flex-col items-end overflow-clip rounded-xl bg-osmoverse-800 px-2 focus-within:bg-osmoverse-900 md:max-w-[6.5rem]">
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
