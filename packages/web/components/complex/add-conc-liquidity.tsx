import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { Pool } from "@osmosis-labs/server";
import { CoinPretty, Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
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
import { AutosizeInput } from "~/components/input/autosize-input";
import { Spinner } from "~/components/loaders/spinner";
import { tError } from "~/components/localization";
import { RouteLane } from "~/components/swap-tool/split-route";
import { CustomClasses } from "~/components/types";
import { ChartButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { EntityImage } from "~/components/ui/entity-image";
import { RecapRow } from "~/components/ui/recap-row";
import { AddConcentratedLiquidityConfig, useTranslation } from "~/hooks";
import type { ZapInConfig } from "~/hooks/ui-config/use-add-concentrated-liquidity-config";
import {
  type HistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
  useHoverPrice,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";
import { getLogoURIs } from "~/utils/logo-uri";
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

/** Single-asset (zap-in) quote and figures from the config hook, plus the
 *  modal-owned high-cost acknowledgement. */
export type ZapInDisplay = Pick<
  ZapInConfig,
  | "zapQuote"
  | "zapSlippageConfig"
  | "zapValueIn"
  | "zapValueOut"
  | "zapTotalCostPercent"
  | "zapHighCost"
> & {
  costAcknowledged: boolean;
  onCostAcknowledgedChange: (acknowledged: boolean) => void;
};

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    zap?: ZapInDisplay;
    actionButton: ReactNode;
    onRequestClose: () => void;
  } & CustomClasses
> = memo(({ className, addLiquidityConfig, zap, actionButton }) => {
  const { poolId } = addLiquidityConfig;

  const { data: pool } = api.local.pools.getPool.useQuery({
    poolId,
  });

  return (
    <div className={classNames("flex flex-col gap-5", className)}>
      <AddConcLiqView
        pool={pool}
        addLiquidityConfig={addLiquidityConfig}
        zap={zap}
        actionButton={actionButton}
      />
    </div>
  );
});

const AddConcLiqView: FunctionComponent<
  {
    pool?: Pool;
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    zap?: ZapInDisplay;
    actionButton: ReactNode;
    isInactivePool?: boolean;
  } & CustomClasses
> = memo(({ addLiquidityConfig, zap, actionButton, pool, isInactivePool }) => {
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
    singleAssetMode,
    singleAssetSide,
    setSingleAssetMode,
    setSingleAssetSide,
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

  // Declared here, not inline in the two-asset branch of the deposit section
  // below, so toggling single-asset mode doesn't change the hook count.
  const onUpdateBaseDeposit = useCallback(
    (amount: string) => {
      setAnchorAsset("base");
      baseDepositAmountIn.setAmount(amount);
    },
    [baseDepositAmountIn, setAnchorAsset]
  );
  const onUpdateQuoteDeposit = useCallback(
    (amount: string) => {
      setAnchorAsset("quote");
      quoteDepositAmountIn.setAmount(amount);
    },
    [quoteDepositAmountIn, setAnchorAsset]
  );

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
                onMoveMax={useMemo(
                  () =>
                    debounce((num: number) => setMaxRange(num.toString()), 250),
                  [setMaxRange]
                )}
                onMoveMin={useMemo(
                  () =>
                    debounce((num: number) => setMinRange(num.toString()), 250),
                  [setMinRange]
                )}
                onSubmitMin={useCallback(
                  (val: number) => {
                    setMinRange(val.toString());
                  },
                  [setMinRange]
                )}
                onSubmitMax={useCallback(
                  (val: number) => {
                    setMaxRange(val.toString());
                  },
                  [setMaxRange]
                )}
                offset={{ top: 0, right: 36, bottom: 24 + 28, left: 0 }}
                horizontal
                fullRange={fullRange}
              />
              {currentRangeApr && (
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
                  {isRangeAprFetching ? (
                    <Spinner className="m-auto mt-1.5" />
                  ) : (
                    <h5 className="text-osmoverse-100">
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
              />
              <PriceInputBox
                label={t("addConcentratedLiquidity.low")}
                forPriceIndex={0}
                addConcLiquidityConfig={addLiquidityConfig}
              />
            </div>
          </div>
        </div>
      </div>
      <StrategySelectorGroup
        addLiquidityConfig={addLiquidityConfig}
        highSpotPriceInputRef={highSpotPriceInputRef}
        isInactivePool={isInactivePool}
      />
      <section className="flex flex-col">
        <div className="subtitle1 flex place-content-between items-center px-4 pb-3">
          <div className="flex items-center gap-3">
            {t("addConcentratedLiquidity.amountToDeposit")}
            <AssetModeSelector
              baseCurrency={pool?.reserveCoins[0]?.currency}
              quoteCurrency={pool?.reserveCoins[1]?.currency}
              singleAssetMode={singleAssetMode}
              singleAssetSide={singleAssetSide}
              onSelectTwoAsset={() => setSingleAssetMode(false)}
              onSelectSingleAsset={(side) => {
                setSingleAssetSide(side);
                setSingleAssetMode(true);
              }}
            />
          </div>
          {!singleAssetMode && isSuperfluidPool && (
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
        {singleAssetMode ? (
          <SingleAssetDeposit
            addLiquidityConfig={addLiquidityConfig}
            zap={zap}
            pool={pool}
          />
        ) : (
          <div className="flex justify-center gap-3 md:flex-col">
            <DepositAmountGroup
              currency={pool?.reserveCoins[0]?.currency}
              className="md:!px-4 md:!py-4"
              priceInputClass=" md:!w-full"
              onUpdate={onUpdateBaseDeposit}
              onMax={setBaseDepositAmountMax}
              currentValue={baseDepositAmountIn.amount}
              outOfRange={quoteDepositOnly}
              percentage={depositPercentages[0]}
            />
            <DepositAmountGroup
              currency={pool?.reserveCoins[1]?.currency}
              className="md:!px-4 md:!py-4"
              priceInputClass=" md:!w-full"
              onUpdate={onUpdateQuoteDeposit}
              onMax={setQuoteDepositAmountMax}
              currentValue={quoteDepositAmountIn.amount}
              outOfRange={baseDepositOnly}
              percentage={depositPercentages[1]}
            />
          </div>
        )}
      </section>
      {actionButton}
    </>
  );
});

/**
 * Single-asset deposit ("zap-in") section: the user enters one side's amount;
 * the config computes the swap split, this shows the breakdown, and the modal
 * submits one swap + create-position transaction.
 */
const SingleAssetDeposit: FunctionComponent<{
  addLiquidityConfig: AddConcentratedLiquidityConfig;
  zap?: ZapInDisplay;
  pool?: Pool;
}> = memo(({ addLiquidityConfig, zap, pool }) => {
  const { t } = useTranslation();
  const {
    singleAssetSide,
    singleAssetDepositAmountIn,
    requiredSwap,
    singleAssetInputState,
    setBaseDepositAmountMax,
    setQuoteDepositAmountMax,
  } = addLiquidityConfig;

  const selectedCurrency =
    singleAssetSide === "base"
      ? pool?.reserveCoins[0]?.currency
      : pool?.reserveCoins[1]?.currency;

  const zapQuote = zap?.zapQuote;
  const quote = zapQuote?.quote;
  const slippageConfig = zap?.zapSlippageConfig;
  const needsSwap = Boolean(requiredSwap?.needsSwap);

  // The floor the swap leg reverts below (mirrors `zapInLiquidity`).
  const minReceived =
    quote && slippageConfig
      ? quote.amount.mul(new Dec(1).sub(slippageConfig.slippage.toDec()))
      : undefined;

  // Value in vs value landing in the position: the gap is the all-in cost of
  // the zap (swap fee + price impact). All three figures come from the config
  // hook's single calculation that also drives the Confirm gate.
  const valueIn = zap?.zapValueIn;
  const valueOut = zap?.zapValueOut;
  const totalCost = valueIn && valueOut ? valueIn.sub(valueOut) : undefined;
  const totalCostPercent = zap?.zapTotalCostPercent;
  const isCostHigh = Boolean(zap?.zapHighCost);

  const onUpdate = useCallback(
    (amount: string) => singleAssetDepositAmountIn.setAmount(amount),
    [singleAssetDepositAmountIn]
  );

  return (
    <div className="flex flex-col gap-3">
      <DepositAmountGroup
        currency={selectedCurrency}
        className="md:!px-4 md:!py-4"
        priceInputClass=" md:!w-full"
        onUpdate={onUpdate}
        onMax={
          singleAssetSide === "base"
            ? setBaseDepositAmountMax
            : setQuoteDepositAmountMax
        }
        currentValue={singleAssetDepositAmountIn.amount}
        percentage={new RatePretty(1)}
      />

      {(singleAssetInputState === "swap" ||
        singleAssetInputState === "one-sided") &&
        requiredSwap && (
          <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 p-4">
            <p className="body2 text-center text-osmoverse-200">
              {singleAssetInputState === "swap"
                ? t("addConcentratedLiquidity.singleAsset.splitBreakdown", {
                    inputAmount: formatPretty(
                      new CoinPretty(
                        requiredSwap.tokenInCurrency,
                        requiredSwap.inputAmount
                      ).hideDenom(true)
                    ),
                    inputDenom: requiredSwap.tokenInCurrency.coinDenom,
                    swapAmount: formatPretty(
                      new CoinPretty(
                        requiredSwap.tokenInCurrency,
                        requiredSwap.swapInAmount
                      ).hideDenom(true)
                    ),
                    swapPercent: formatPretty(
                      new RatePretty(
                        requiredSwap.swapInAmount
                          .toDec()
                          .quo(requiredSwap.inputAmount.toDec())
                      ).maxDecimals(1)
                    ),
                    outDenom: requiredSwap.tokenOutCurrency.coinDenom,
                  })
                : t("addConcentratedLiquidity.singleAsset.noSwapNeeded", {
                    inputDenom: requiredSwap.tokenInCurrency.coinDenom,
                  })}
            </p>

            {needsSwap &&
              (zapQuote?.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-osmoverse-300">
                  <Spinner className="!h-4 !w-4" />
                  <span className="caption">
                    {t("addConcentratedLiquidity.singleAsset.quoteLoading")}
                  </span>
                </div>
              ) : !quote ? (
                // Not loading and still no quote: show the typed router error
                // (no route / insufficient liquidity / amount too small)
                // instead of an eternal spinner. Submit stays disabled.
                <p className="caption py-2 text-center text-rust-300">
                  {zapQuote?.routerError
                    ? t(...tError(zapQuote.routerError))
                    : t("transfer.transferAmountTooLowValueLoss")}
                </p>
              ) : (
                <div className="mx-auto flex w-full max-w-lg flex-col">
                  {minReceived && (
                    <RecapRow
                      left={t("receiveAtLeast")}
                      right={
                        <span className="body2 text-white-full">
                          {formatPretty(minReceived)}
                        </span>
                      }
                    />
                  )}
                  {valueIn && (
                    <RecapRow
                      left={t("addConcentratedLiquidity.singleAsset.valueIn")}
                      right={
                        <span className="body2 text-osmoverse-200">
                          {formatPretty(
                            valueIn,
                            getPriceExtendedFormatOptions(valueIn.toDec())
                          )}
                        </span>
                      }
                    />
                  )}
                  {valueOut && (
                    <RecapRow
                      left={t("addConcentratedLiquidity.singleAsset.valueOut")}
                      right={
                        <span className="body2 text-osmoverse-200">
                          {formatPretty(
                            valueOut,
                            getPriceExtendedFormatOptions(valueOut.toDec())
                          )}
                        </span>
                      }
                    />
                  )}
                  {quote.swapFee && quote.tokenInFeeAmount && (
                    <RecapRow
                      left={t("pools.aprBreakdown.swapFees")}
                      right={
                        <span className="body2 text-osmoverse-200">
                          {formatPretty(
                            new CoinPretty(
                              requiredSwap.tokenInCurrency,
                              quote.tokenInFeeAmount
                            )
                          )}{" "}
                          ({quote.swapFee.toString()})
                        </span>
                      }
                    />
                  )}
                  {totalCost && totalCostPercent && (
                    <RecapRow
                      left={
                        <Tooltip
                          content={t("tradeDetails.outputDifference.content")}
                        >
                          <span>
                            {t(
                              "addConcentratedLiquidity.singleAsset.totalCost"
                            )}
                          </span>
                        </Tooltip>
                      }
                      right={
                        <span
                          className={classNames(
                            "body2",
                            isCostHigh ? "text-rust-400" : "text-osmoverse-200"
                          )}
                        >
                          -
                          {formatPretty(
                            totalCost,
                            getPriceExtendedFormatOptions(totalCost.toDec())
                          )}{" "}
                          ({formatPretty(totalCostPercent.maxDecimals(2))})
                        </span>
                      }
                    />
                  )}
                  {slippageConfig && (
                    <RecapRow
                      left={t("swap.settings.slippage")}
                      right={<SlippageInput slippageConfig={slippageConfig} />}
                    />
                  )}
                  {quote.split.length > 0 && (
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <DisclosureButton className="flex min-h-[2rem] w-full items-center justify-between sm:min-h-[1.5rem]">
                            <span className="sm:caption text-osmoverse-300">
                              {t("swap.autoRouter")}
                            </span>
                            <div className="flex items-center gap-1 text-wosmongton-300">
                              <span>
                                {quote.split.length}{" "}
                                {quote.split.length === 1
                                  ? t("swap.route")
                                  : t("swap.routes")}
                              </span>
                              <Icon
                                id="chevron-down"
                                className={classNames(
                                  "h-[7px] w-3 text-wosmongton-200 transition-transform",
                                  { "rotate-180": open }
                                )}
                              />
                            </div>
                          </DisclosureButton>
                          <DisclosurePanel className="flex w-full flex-col gap-2 pb-2">
                            {quote.split.map((route) => (
                              <RouteLane
                                key={route.pools.map(({ id }) => id).join()}
                                route={route}
                              />
                            ))}
                          </DisclosurePanel>
                        </>
                      )}
                    </Disclosure>
                  )}
                </div>
              ))}

            {isCostHigh && zap && (
              <div className="flex items-center gap-3 rounded-xl border border-rust-500 bg-rust-800/40 p-3">
                <Icon
                  id="alert-circle-filled"
                  width={16}
                  height={16}
                  className="shrink-0 text-rust-300"
                />
                <p className="body2 flex-1 text-left text-rust-300">
                  {/* The gate flags on TOTAL cost (impact + swap fees), so the
                      warning quotes that figure under its own label. */}
                  {t("addConcentratedLiquidity.singleAsset.totalCostWarning", {
                    totalCost: formatPretty(
                      totalCostPercent ?? new RatePretty(0)
                    ),
                  })}
                </p>
                <label
                  htmlFor="cl-zap-high-cost-ack"
                  className="body2 shrink-0"
                >
                  {t("transfer.confirm")}
                </label>
                <Checkbox
                  id="cl-zap-high-cost-ack"
                  variant="destructive"
                  className="shrink-0"
                  checked={zap.costAcknowledged}
                  onCheckedChange={(checked) =>
                    zap.onCostAcknowledgedChange(checked === true)
                  }
                />
              </div>
            )}
          </div>
        )}
    </div>
  );
});

/** Editable slippage-tolerance input for the zap-in swap leg, mirroring the
 *  swap review's slippage box. */
const SlippageInput: FunctionComponent<{
  slippageConfig: ZapInDisplay["zapSlippageConfig"];
}> = memo(({ slippageConfig }) => {
  const [manualSlippage, setManualSlippage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { setManualSlippage: commitSlippage, defaultManualSlippage } =
    slippageConfig;

  const handleChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      if (value === "" || !Number.isFinite(parsed)) {
        setManualSlippage("");
        commitSlippage(defaultManualSlippage);
        return;
      }
      // Clamp so a negative or huge entry can't break the min-out math.
      const clamped = Math.max(0, Math.min(50, parsed));
      setManualSlippage(clamped.toString());
      commitSlippage(new Dec(clamped).toString());
    },
    [commitSlippage, defaultManualSlippage]
  );

  return (
    <div
      className={classNames(
        "body2 flex w-fit items-center justify-center overflow-hidden rounded-lg px-2 py-0.5 text-center transition-all",
        isEditing
          ? "border-2 border-solid border-wosmongton-300 bg-osmoverse-900"
          : "border border-osmoverse-700 bg-osmoverse-850"
      )}
    >
      <AutosizeInput
        type="text"
        inputMode="decimal"
        minWidth={36}
        placeholder={defaultManualSlippage + "%"}
        className="body2 w-fit bg-transparent px-0"
        inputClassName="body2 !bg-transparent text-right placeholder:text-wosmongton-300 focus:text-center transition-all focus-visible:outline-none"
        value={manualSlippage}
        onFocus={() => {
          slippageConfig.setIsManualSlippage(true);
          setIsEditing(true);
        }}
        onBlur={() => setIsEditing(false)}
        onChange={(e) => handleChange(e.target.value)}
      />
      {manualSlippage !== "" && <span className="body2">%</span>}
    </div>
  );
});

/** Currency shape needed to render an asset icon. */
type IconCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinImageUrl?: string;
};

/** One selectable icon in the asset-mode selector: a 2px `bg-supercharged`
 *  frame around the selected option, like the volatility-strategy cards. */
const AssetModeOption: FunctionComponent<{
  selected: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}> = ({ selected, onClick, label, children }) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={selected}
    title={label}
    onClick={onClick}
    className={classNames(
      "flex items-center justify-center rounded-xl p-[2px] transition-colors",
      {
        "bg-supercharged": selected,
        "hover:bg-osmoverse-700": !selected,
      }
    )}
  >
    <div className="flex h-full w-full items-center justify-center rounded-[0.625rem] bg-osmoverse-800 px-2 py-1.5">
      {children}
    </div>
  </button>
);

/**
 * Icon selector for the deposit mode: the overlapping pair icon selects
 * two-asset mode; each token icon selects single-asset mode for that side.
 */
const AssetModeSelector: FunctionComponent<{
  baseCurrency?: IconCurrency;
  quoteCurrency?: IconCurrency;
  singleAssetMode: boolean;
  singleAssetSide: "base" | "quote";
  onSelectTwoAsset: () => void;
  onSelectSingleAsset: (side: "base" | "quote") => void;
}> = ({
  baseCurrency,
  quoteCurrency,
  singleAssetMode,
  singleAssetSide,
  onSelectTwoAsset,
  onSelectSingleAsset,
}) => {
  if (!baseCurrency || !quoteCurrency) return null;

  // The pair is composed from two overlapping icons at the row's icon size.
  const iconSize = 24;
  const overlap = 8;

  const assetIcon = (currency: IconCurrency) => (
    <EntityImage
      logoURIs={getLogoURIs(currency.coinImageUrl)}
      name={currency.coinDenom}
      symbol={currency.coinDenom}
      width={iconSize}
      height={iconSize}
    />
  );

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-osmoverse-800 p-0">
      <AssetModeOption
        selected={!singleAssetMode}
        onClick={onSelectTwoAsset}
        label={`${baseCurrency.coinDenom} / ${quoteCurrency.coinDenom}`}
      >
        <div
          className="relative flex items-center"
          style={{ width: iconSize * 2 - overlap, height: iconSize }}
        >
          {/* base on top of quote, matching the pool-title overlap order */}
          <div style={{ left: iconSize - overlap }} className="absolute z-0">
            {assetIcon(quoteCurrency)}
          </div>
          <div className="absolute left-0 z-10">{assetIcon(baseCurrency)}</div>
        </div>
      </AssetModeOption>
      <AssetModeOption
        selected={singleAssetMode && singleAssetSide === "base"}
        onClick={() => onSelectSingleAsset("base")}
        label={baseCurrency.coinDenom}
      >
        {assetIcon(baseCurrency)}
      </AssetModeOption>
      <AssetModeOption
        selected={singleAssetMode && singleAssetSide === "quote"}
        onClick={() => onSelectSingleAsset("quote")}
        label={quoteCurrency.coinDenom}
      >
        {assetIcon(quoteCurrency)}
      </AssetModeOption>
    </div>
  );
};

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

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: AddConcentratedLiquidityConfig;
    highSpotPriceInputRef: React.MutableRefObject<HTMLInputElement | null>;
    isInactivePool?: boolean;
  } & CustomClasses
> = memo((props) => {
  const { t } = useTranslation();
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
    <section className="flex flex-row justify-between gap-y-4 1.5md:flex-col">
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
        />
        <div className="flex gap-2 xs:flex-wrap">
          <PresetStrategyCard
            type="passive"
            src="/images/small-vial.svg"
            addLiquidityConfig={props.addLiquidityConfig}
            label="Passive"
            className="sm:flex-1"
            disabledForInactivePool={false}
          />
          <PresetStrategyCard
            type="moderate"
            src="/images/medium-vial.svg"
            addLiquidityConfig={props.addLiquidityConfig}
            label="Moderate"
            className="sm:flex-1"
            disabledForInactivePool={props.isInactivePool}
          />
          <PresetStrategyCard
            type="aggressive"
            src="/images/large-vial.svg"
            addLiquidityConfig={props.addLiquidityConfig}
            label="Aggressive"
            className="sm:flex-1"
            disabledForInactivePool={props.isInactivePool}
          />
        </div>
      </div>
    </section>
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

    const isSelected = type === currentStrategy;

    const updateInputAndRangeMinMax = useCallback(
      (min: Dec, max: Dec) => {
        // moderate and aggressive needs to account for currency decimals
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

    // Check if disabled for pegged currencies (hide completely)
    const disabledForPeggedCurrencies =
      "moderate" === type &&
      aggressivePriceRange[0].equals(moderatePriceRange[0]) &&
      aggressivePriceRange[1].equals(moderatePriceRange[1]);

    // not an option for pegged currencies
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

const PriceInputBox: FunctionComponent<{
  label: string;
  forPriceIndex: 0 | 1;
  addConcLiquidityConfig: AddConcentratedLiquidityConfig;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}> = memo(({ label, forPriceIndex, addConcLiquidityConfig, inputRef }) => {
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
          onInput={(val) =>
            forPriceIndex === 0
              ? addConcLiquidityConfig.setMinRange(val)
              : addConcLiquidityConfig.setMaxRange(val)
          }
          onBlur={() => setIsFocused(false)}
        />
      )}
    </div>
  );
});
