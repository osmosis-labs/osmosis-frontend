import { Disclosure } from "@headlessui/react";
import type { Pool } from "@osmosis-labs/server";
import { CoinPretty, Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
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
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import {
  ChartUnavailable,
  PriceChartHeader,
} from "~/components/chart/price-historical";
import { DepositAmountGroup } from "~/components/cl-deposit-input-group";
import { InputBox } from "~/components/input";
import { Spinner } from "~/components/loaders/spinner";
import { tError } from "~/components/localization";
import { RouteLane } from "~/components/swap-tool/split-route";
import { CustomClasses } from "~/components/types";
import { ChartButton } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { EntityImage } from "~/components/ui/entity-image";
import { RecapRow } from "~/components/ui/recap-row";
import { EventName } from "~/config/analytics-events";
import {
  ObservableAddConcentratedLiquidityConfig,
  useAmplitudeAnalytics,
  useTranslation,
} from "~/hooks";
import {
  getTokenInFeeAmountFiatValue,
  getTokenOutFiatValue,
} from "~/hooks/fiat-getters";
import {
  ObservableHistoricalAndLiquidityData,
  useHistoricalAndLiquidityData,
} from "~/hooks/ui-config/use-historical-and-depth-data";
import type { useSlippageConfig } from "~/hooks/ui-config/use-slippage-config";
import type { useClZapQuote } from "~/hooks/use-cl-zap-quote";
import { useStore } from "~/stores";
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

export const AddConcLiquidity: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    zapQuote?: ReturnType<typeof useClZapQuote>;
    zapSlippageConfig?: ReturnType<typeof useSlippageConfig>;
    zapHighCost?: boolean;
    zapCostAcknowledged?: boolean;
    onZapCostAcknowledgedChange?: (acknowledged: boolean) => void;
    actionButton: ReactNode;
    onRequestClose: () => void;
  } & CustomClasses
> = observer(
  ({
    className,
    addLiquidityConfig,
    zapQuote,
    zapSlippageConfig,
    zapHighCost,
    zapCostAcknowledged,
    onZapCostAcknowledgedChange,
    actionButton,
  }) => {
    const { poolId } = addLiquidityConfig;

    const { data: pool } = api.local.pools.getPool.useQuery({
      poolId,
    });

    return (
      <div className={classNames("flex flex-col gap-5", className)}>
        <AddConcLiqView
          pool={pool}
          addLiquidityConfig={addLiquidityConfig}
          zapQuote={zapQuote}
          zapSlippageConfig={zapSlippageConfig}
          zapHighCost={zapHighCost}
          zapCostAcknowledged={zapCostAcknowledged}
          onZapCostAcknowledgedChange={onZapCostAcknowledgedChange}
          actionButton={actionButton}
        />
      </div>
    );
  }
);

const AddConcLiqView: FunctionComponent<
  {
    pool?: Pool;
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    zapQuote?: ReturnType<typeof useClZapQuote>;
    zapSlippageConfig?: ReturnType<typeof useSlippageConfig>;
    zapHighCost?: boolean;
    zapCostAcknowledged?: boolean;
    onZapCostAcknowledgedChange?: (acknowledged: boolean) => void;
    actionButton: ReactNode;
    isInactivePool?: boolean;
  } & CustomClasses
> = observer(
  ({
    addLiquidityConfig,
    zapQuote,
    zapSlippageConfig,
    zapHighCost,
    zapCostAcknowledged,
    onZapCostAcknowledgedChange,
    actionButton,
    pool,
    isInactivePool,
  }) => {
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

    // Hoisted out of the JSX below: these were previously declared inside the
    // `singleAssetMode ? … : …` ternary's two-asset branch, so toggling
    // single-asset mode changed the number of hooks this component called and
    // crashed the render ("rendered fewer hooks than expected"). They must run
    // unconditionally on every render regardless of mode.
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
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                  onMoveMax={useCallback(
                    debounce((num: number) => setMaxRange(num.toString()), 250),
                    []
                  )}
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                  onMoveMin={useCallback(
                    debounce((num: number) => setMinRange(num.toString()), 250),
                    []
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
                        {queryCurrentRangeApr.apr.maxDecimals(1).toString() ??
                          ""}{" "}
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
            {!singleAssetMode && superfluidPoolDetail.isSuperfluid && (
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
          {singleAssetMode ? (
            <SingleAssetDeposit
              addLiquidityConfig={addLiquidityConfig}
              zapQuote={zapQuote}
              zapSlippageConfig={zapSlippageConfig}
              zapHighCost={zapHighCost}
              zapCostAcknowledged={zapCostAcknowledged}
              onZapCostAcknowledgedChange={onZapCostAcknowledgedChange}
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
  }
);

/**
 * Single-asset deposit ("zap-in") section: the user picks one side and an
 * amount; the frontend computes the swap split, shows the breakdown and quote
 * details, and the parent submits a single swap + create-position transaction.
 */
const SingleAssetDeposit: FunctionComponent<{
  addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  zapQuote?: ReturnType<typeof useClZapQuote>;
  zapSlippageConfig?: ReturnType<typeof useSlippageConfig>;
  zapHighCost?: boolean;
  zapCostAcknowledged?: boolean;
  onZapCostAcknowledgedChange?: (acknowledged: boolean) => void;
  pool?: Pool;
}> = observer(
  ({
    addLiquidityConfig,
    zapQuote,
    zapSlippageConfig,
    zapHighCost,
    zapCostAcknowledged,
    onZapCostAcknowledgedChange,
    pool,
  }) => {
    const { t } = useTranslation();
    const {
      singleAssetSide,
      singleAssetDepositAmountIn,
      requiredSwap,
      singleAssetInputState,
      baseDepositPrice,
      quoteDepositPrice,
      setBaseDepositAmountMax,
      setQuoteDepositAmountMax,
    } = addLiquidityConfig;

    // The side is chosen on the asset-mode selector row above; this section just
    // renders the deposit input and quote breakdown for the selected side.
    const baseCurrency = pool?.reserveCoins[0]?.currency;
    const quoteCurrency = pool?.reserveCoins[1]?.currency;
    const selectedCurrency =
      singleAssetSide === "base" ? baseCurrency : quoteCurrency;

    const quote = zapQuote?.quote;
    const needsSwap = Boolean(requiredSwap?.needsSwap);

    // Minimum the swap leg guarantees: quote out minus the user's slippage. This
    // is the floor the on-chain swap reverts below (mirrors `zapInLiquidity`),
    // surfaced so the user sees the guaranteed amount, not just the estimate.
    const minReceived =
      quote && zapSlippageConfig
        ? quote.amount.mul(new Dec(1).sub(zapSlippageConfig.slippage.toDec()))
        : undefined;

    // Fiat value the user puts in vs. the total value landing in the position
    // (retained input side + swapped output side). The gap is the all-in cost of
    // the zap: swap fee + price impact. Surfaced instead of price impact, which
    // alone only covers the swap leg, not the whole deposit.
    //
    // Both sides are valued off the SAME token-in price, deriving the swap output
    // value from price impact + fee (the swap tool's `getTokenOutFiatValue`
    // method), not an independent output oracle price. Mixing two price sources
    // let the swap look value-positive (value out > value in), which is
    // impossible for a fee-and-impact-bearing swap.
    const inputPrice =
      singleAssetSide === "base" ? baseDepositPrice : quoteDepositPrice;

    const valueIn =
      requiredSwap && inputPrice
        ? inputPrice.mul(
            new CoinPretty(
              requiredSwap.tokenInCurrency,
              requiredSwap.inputAmount
            )
          )
        : undefined;

    // Value of just the swapped portion of the input, then the swap output's value
    // after price impact and fee. The retained portion keeps its full input value.
    const swapInValue =
      requiredSwap && inputPrice
        ? inputPrice.mul(
            new CoinPretty(
              requiredSwap.tokenInCurrency,
              requiredSwap.swapInAmount
            )
          )
        : undefined;

    const valueOut =
      requiredSwap && quote && inputPrice && swapInValue
        ? inputPrice
            .mul(
              new CoinPretty(
                requiredSwap.tokenInCurrency,
                requiredSwap.inputAmount.sub(requiredSwap.swapInAmount)
              )
            )
            .add(
              getTokenOutFiatValue(
                quote.priceImpactTokenOut?.toDec(),
                swapInValue.toDec()
              ).sub(
                getTokenInFeeAmountFiatValue(
                  requiredSwap.tokenInCurrency,
                  quote.tokenInFeeAmount,
                  inputPrice
                )
              )
            )
        : undefined;

    // Total cost of the zap: the full value lost between what goes in and what
    // lands in the position (swap fee + price impact combined). Shown below the
    // swap-fee row since it includes that fee. Flagged rust at the swap tool's
    // high-impact threshold so a thin-pool loss can't slip by unnoticed.
    const totalCost = valueIn && valueOut ? valueIn.sub(valueOut) : undefined;
    const totalCostPercent =
      totalCost && valueIn && valueIn.toDec().isPositive()
        ? new RatePretty(totalCost.toDec().quo(valueIn.toDec()))
        : undefined;
    const isCostHigh = Boolean(
      quote?.priceImpactTokenOut?.toDec().lt(new Dec(-0.1))
    );

    return (
      <div className="flex flex-col gap-3">
        <DepositAmountGroup
          currency={selectedCurrency}
          className="md:!px-4 md:!py-4"
          priceInputClass=" md:!w-full"
          onUpdate={useCallback(
            (amount) => {
              singleAssetDepositAmountIn.setAmount(amount);
            },
            [singleAssetDepositAmountIn]
          )}
          onMax={
            singleAssetSide === "base"
              ? setBaseDepositAmountMax
              : setQuoteDepositAmountMax
          }
          currentValue={singleAssetDepositAmountIn.amount}
          percentage={new RatePretty(1)}
        />

        {(singleAssetInputState === "swap" ||
          singleAssetInputState === "one-sided") && (
          <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-900 p-4">
            {singleAssetInputState === "swap" && requiredSwap ? (
              <p className="body2 text-center text-osmoverse-200">
                {t("addConcentratedLiquidity.singleAsset.splitBreakdown", {
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
                })}
              </p>
            ) : requiredSwap ? (
              <p className="body2 text-center text-osmoverse-200">
                {t("addConcentratedLiquidity.singleAsset.noSwapNeeded", {
                  inputDenom: requiredSwap.tokenInCurrency.coinDenom,
                })}
              </p>
            ) : null}

            {needsSwap &&
              requiredSwap &&
              (zapQuote?.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-osmoverse-300">
                  <Spinner className="!h-4 !w-4" />
                  <span className="caption">
                    {t("addConcentratedLiquidity.singleAsset.quoteLoading")}
                  </span>
                </div>
              ) : !quote ? (
                // Not loading and still no quote: surface the actual cause from
                // the typed router error (no route / insufficient liquidity /
                // amount too small to quote) instead of an eternal spinner. When
                // SQS returns nothing without an error (sub-minimum amount), fall
                // back to "amount too low". Submit stays disabled either way.
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
                          {formatPretty(valueIn, { maxDecimals: 2 })}
                        </span>
                      }
                    />
                  )}
                  {valueOut && (
                    <RecapRow
                      left={t("addConcentratedLiquidity.singleAsset.valueOut")}
                      right={
                        <span className="body2 text-osmoverse-200">
                          {formatPretty(valueOut, { maxDecimals: 2 })}
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
                          -{formatPretty(totalCost, { maxDecimals: 2 })} (
                          {formatPretty(totalCostPercent.maxDecimals(2))})
                        </span>
                      }
                    />
                  )}
                  {zapSlippageConfig && (
                    <RecapRow
                      left={t("swap.settings.slippage")}
                      right={
                        <SlippageInput slippageConfig={zapSlippageConfig} />
                      }
                    />
                  )}
                  {quote.split.length > 0 && (
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex min-h-[2rem] w-full items-center justify-between sm:min-h-[1.5rem]">
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
                          </Disclosure.Button>
                          <Disclosure.Panel className="flex w-full flex-col gap-2 pb-2">
                            {quote.split.map((route) => (
                              <RouteLane
                                key={route.pools.map(({ id }) => id).join()}
                                route={route}
                              />
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  )}
                </div>
              ))}

            {zapHighCost && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-osmoverse-825 p-3">
                <div className="flex items-center justify-center gap-2 text-rust-300">
                  <Icon
                    id="alert-circle-filled"
                    width={16}
                    height={16}
                    className="shrink-0"
                  />
                  <p className="body2 text-center">
                    {t("transfer.priceImpactWarning", {
                      priceImpact: formatPretty(
                        quote?.priceImpactTokenOut ?? new RatePretty(0)
                      ),
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label htmlFor="cl-zap-high-cost-ack" className="body2">
                    {t("transfer.confirm")}
                  </label>
                  <Checkbox
                    id="cl-zap-high-cost-ack"
                    variant="destructive"
                    checked={Boolean(zapCostAcknowledged)}
                    onCheckedChange={(checked) =>
                      onZapCostAcknowledgedChange?.(checked === true)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

/** Editable slippage-tolerance input for the zap-in swap leg, mirroring the
 *  swap tool / review-order slippage box. */
const SlippageInput: FunctionComponent<{
  slippageConfig: ReturnType<typeof useSlippageConfig>;
}> = observer(({ slippageConfig }) => {
  const [manualSlippage, setManualSlippage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      if (value === "" || !Number.isFinite(parsed)) {
        setManualSlippage("");
        slippageConfig.setManualSlippage(slippageConfig.defaultManualSlippage);
        return;
      }
      // Clamp to a sane range so a negative / huge / non-finite entry can't
      // produce a nonsensical minReceived or break the Dec math.
      const clamped = Math.max(0, Math.min(50, parsed));
      setManualSlippage(clamped.toString());
      slippageConfig.setManualSlippage(new Dec(clamped).toString());
    },
    [slippageConfig]
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
        placeholder={slippageConfig.defaultManualSlippage + "%"}
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

const StrategySelectorGroup: FunctionComponent<
  {
    addLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
    highSpotPriceInputRef: React.MutableRefObject<HTMLInputElement | null>;
    isInactivePool?: boolean;
  } & CustomClasses
> = observer((props) => {
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

/** Currency shape needed to render an asset icon. */
type IconCurrency = {
  coinDenom: string;
  coinMinimalDenom: string;
  coinImageUrl?: string;
};

/** A single selectable icon in the asset-mode selector. Mirrors the
 *  volatility-strategy cards: a 2px `bg-supercharged` gradient frame around an
 *  inner card reads as a border on the selected option, not a fill. */
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
 * Text-free, icon-based selector for the deposit mode on the CL add-position
 * row. The overlapping pair icon selects two-asset mode; each individual token
 * icon selects single-asset mode for that side. The active option is
 * highlighted with the same `bg-supercharged` treatment as the volatility
 * strategy cards, so the chosen side reads off this one row and the single-asset
 * section no longer needs its own base/quote toggle.
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
  // Pool data not loaded yet: nothing to render the icons from.
  if (!baseCurrency || !quoteCurrency) return null;

  // All three options render at the same icon height so they sit on one row
  // (the shared PoolAssetsIcon is taller than the row, so the pair is composed
  // from two overlapping icons at this size instead).
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
  addConcLiquidityConfig: ObservableAddConcentratedLiquidityConfig;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}> = observer(({ label, forPriceIndex, addConcLiquidityConfig, inputRef }) => {
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
