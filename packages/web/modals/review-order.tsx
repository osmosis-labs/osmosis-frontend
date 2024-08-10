import {
  CoinPretty,
  Dec,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { GenericDisclaimer } from "~/components/tooltip/generic-disclaimer";
import { RecapRow } from "~/components/ui/recap-row";
import { Skeleton } from "~/components/ui/skeleton";
import { EventName, EventPage } from "~/config/analytics-events";
import {
  Breakpoint,
  useAmplitudeAnalytics,
  useOneClickTradingSession,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { isValidNumericalRawInput } from "~/hooks/input/use-amount-input";
import { useSwap } from "~/hooks/use-swap";
import { ModalBase } from "~/modals";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

interface ReviewOrderProps {
  isOpen: boolean;
  onClose: () => void;
  confirmAction: () => void;
  isConfirmationDisabled: boolean;
  slippageConfig?: ObservableSlippageConfig;
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  outputDifference?: RatePretty;
  showOutputDifferenceWarning?: boolean;
  percentAdjusted?: Dec;
  limitPriceFiat?: PricePretty;
  limitSetPriceLock?: (lock: boolean) => void;
  baseDenom?: string;
  title: string;
  gasAmount?: PricePretty;
  isGasLoading?: boolean;
  gasError?: Error | null;
  expectedOutput?: CoinPretty;
  expectedOutputFiat?: PricePretty;
  inAmountToken?: CoinPretty;
  inAmountFiat?: PricePretty;
  fromAsset?: ReturnType<typeof useSwap>["fromAsset"];
  toAsset?: ReturnType<typeof useSwap>["toAsset"];
  page?: EventPage;
  isBeyondOppositePrice?: boolean;
}

export function ReviewOrder({
  isOpen,
  onClose,
  confirmAction,
  isConfirmationDisabled,
  slippageConfig,
  outAmountLessSlippage,
  outFiatAmountLessSlippage,
  outputDifference,
  showOutputDifferenceWarning,
  percentAdjusted,
  limitPriceFiat,
  baseDenom,
  title,
  gasAmount,
  isGasLoading,
  gasError,
  limitSetPriceLock,
  expectedOutput,
  expectedOutputFiat,
  inAmountToken,
  inAmountFiat,
  toAsset,
  fromAsset,
  page,
  isBeyondOppositePrice = false,
}: ReviewOrderProps) {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();
  const [manualSlippage, setManualSlippage] = useState("");
  const [isEditingSlippage, setIsEditingSlippage] = useState(false);
  const [tab] = useQueryState("tab", parseAsString.withDefault("swap"));
  const { isOneClickTradingEnabled } = useOneClickTradingSession();
  const [orderType] = useQueryState(
    "type",
    parseAsString.withDefault("market")
  );
  const { isMobile } = useWindowSize(Breakpoint.sm);

  const isManualSlippageTooHigh = +manualSlippage > 1;
  const isManualSlippageTooLow = manualSlippage !== "" && +manualSlippage < 0.1;

  //Value is memoized as it must be frozen when the component is mounted
  const initialOutput = useMemo(
    () => outAmountLessSlippage ?? new IntPretty(0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { diffGteSlippage, restart } = useMemo(
    () => {
      let originalValue = initialOutput;
      return {
        diffGteSlippage: slippageConfig
          ? originalValue
              .sub(outAmountLessSlippage ?? new IntPretty(0))
              .toDec()
              .gte(slippageConfig?.slippage.toDec())
          : false,
        restart: () => {
          originalValue = outAmountLessSlippage ?? new IntPretty(0);
        },
      };
    },

    /**
     * Dependencies are disabled for this hook as we only want to update the
     * current slippage amount when the outAmountLessSlippage changes.
     *
     * This is to monitor if the output amount changes too much from the original
     * quote so as to warn the user.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outAmountLessSlippage, slippageConfig]
  );

  const handleManualSlippageChange = useCallback(
    (value: string) => {
      if (value.length > 3) return;

      if (value === "") {
        setManualSlippage("");
        slippageConfig?.setManualSlippage(
          slippageConfig?.defaultManualSlippage
        );
        return;
      }

      if (!isValidNumericalRawInput(value)) {
        return;
      }

      setManualSlippage(value);
      slippageConfig?.setManualSlippage(new Dec(+value).toString());
    },
    [slippageConfig]
  );

  useEffect(() => {
    if (limitSetPriceLock && orderType === "limit") limitSetPriceLock(isOpen);
  }, [limitSetPriceLock, isOpen, orderType]);

  const gasFeeError = useMemo(() => {
    if (!!gasAmount && !gasError) return;

    return isOneClickTradingEnabled
      ? t("swap.gas.oneClickTradingError")
      : t("swap.gas.error");
  }, [gasAmount, isOneClickTradingEnabled, gasError, t]);

  const GasEstimation = useMemo(() => {
    return !!gasFeeError ? (
      <GenericDisclaimer
        title={t("swap.gas.gasEstimationError")}
        body={gasFeeError}
      >
        <span className="sm:caption flex items-center gap-1">
          <Icon
            id="question"
            width={isMobile ? 20 : 24}
            height={isMobile ? 20 : 24}
            className="scale-75 text-osmoverse-300"
          />{" "}
          {t("swap.gas.unknown")}
        </span>
      </GenericDisclaimer>
    ) : (
      <span
        className={classNames(
          "sm:caption inline-flex items-center gap-1 text-osmoverse-100",
          { "animate-pulse": isGasLoading }
        )}
      >
        <Icon id="gas" width={16} height={16} />
        {gasAmount && gasAmount.toString()}
      </span>
    );
  }, [gasAmount, isGasLoading, gasFeeError, isMobile, t]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      hideCloseButton
      className="w-[512px] rounded-2xl !p-0 sm:h-full sm:max-h-[100vh] sm:!rounded-none"
    >
      <div className="flex h-auto w-full flex-col bg-osmoverse-850">
        <div className="relative flex h-20 items-center justify-center p-4">
          <h6>{title}</h6>
          <button
            onClick={onClose}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
          >
            <Icon id="thin-x" className="text-wosmongton-200" />
          </button>
        </div>
        <div
          className={classNames("flex flex-col px-8", {
            "pb-8": !diffGteSlippage,
          })}
        >
          {orderType === "limit" && tab !== "swap" && (
            <div className="sm:caption flex flex-col rounded-t-2xl border border-osmoverse-700 px-4 py-2">
              <div className="flex items-center gap-4">
                <div className="flex h-10 min-w-10 items-center justify-center">
                  {(tab === "buy" && !isBeyondOppositePrice) ||
                  (tab === "sell" && isBeyondOppositePrice) ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15 15C15 14.4477 15.4477 14 16 14H18.5858L12.5 7.91421L9.20711 11.2071C9.01957 11.3946 8.76522 11.5 8.5 11.5C8.23478 11.5 7.98043 11.3946 7.79289 11.2071L2.29289 5.70711C1.90237 5.31658 1.90237 4.68342 2.29289 4.29289C2.68342 3.90237 3.31658 3.90237 3.70711 4.29289L8.5 9.08579L11.7929 5.79289C12.1834 5.40237 12.8166 5.40237 13.2071 5.79289L20 12.5858V10C20 9.44772 20.4477 9 21 9C21.5523 9 22 9.44772 22 10V15C22 15.5523 21.5523 16 21 16H16C15.4477 16 15 15.5523 15 15ZM3 20C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H3Z"
                        fill="#958FC0"
                      />
                    </svg>
                  ) : (
                    <Icon
                      id="trade"
                      width={24}
                      height={24}
                      className="text-osmoverse-400"
                    />
                  )}
                </div>
                <span className="flex-1 text-osmoverse-300">
                  If {baseDenom} price reaches{" "}
                  {limitPriceFiat &&
                    formatPretty(
                      limitPriceFiat,
                      getPriceExtendedFormatOptions(limitPriceFiat.toDec())
                    )}
                </span>
                {percentAdjusted && (
                  <div className="flex items-center">
                    <div className="flex h-6 w-6 items-center justify-center">
                      {!percentAdjusted.isZero() && (
                        <Icon
                          id="triangle-down"
                          width={11}
                          height={6}
                          className={classNames({
                            "rotate-180 text-bullish-400":
                              (tab === "buy" && isBeyondOppositePrice) ||
                              (tab === "sell" && !isBeyondOppositePrice),
                            "rotate-0 text-rust-500":
                              (tab === "buy" && !isBeyondOppositePrice) ||
                              (tab === "sell" && isBeyondOppositePrice),
                          })}
                        />
                      )}
                    </div>
                    <span>
                      {formatPretty(percentAdjusted.mul(new Dec(100)).abs(), {
                        maxDecimals: 3,
                      })}
                      %
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className={classNames(
              "flex flex-col rounded-b-2xl border border-osmoverse-700 p-2",
              {
                "rounded-t-2xl": orderType !== "limit",
                "border-t-0": orderType === "limit",
              }
            )}
          >
            <div className="flex items-end justify-between p-2">
              <div className="flex items-center gap-4">
                {fromAsset && (
                  <Image
                    src={fromAsset.coinImageUrl ?? ""}
                    alt={`${fromAsset.coinDenom} image`}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                )}
                <div className="flex flex-col">
                  <p className="sm:caption text-osmoverse-300">
                    {tab === "buy"
                      ? t("limitOrders.pay")
                      : t("limitOrders.sell")}
                  </p>
                  {inAmountToken && (
                    <span className="subtitle1 sm:subtitle2">
                      {formatPretty(inAmountToken)}
                    </span>
                  )}
                </div>
              </div>
              <div className="sm:subtitle2 flex flex-col items-end">
                {formatPretty(
                  inAmountFiat ?? new PricePretty(DEFAULT_VS_CURRENCY, 0),
                  {
                    ...getPriceExtendedFormatOptions(
                      inAmountFiat?.toDec() ?? new Dec(0)
                    ),
                  }
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center">
                  <Icon
                    id="arrow-down"
                    className="h-6 w-6 text-osmoverse-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between p-2">
              <div className="flex items-center gap-4">
                {toAsset && (
                  <Image
                    src={toAsset.coinImageUrl ?? ""}
                    alt={`${toAsset.coinDenom} image`}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                )}
                <div className="flex flex-col">
                  <p className="sm:caption text-osmoverse-300">
                    {tab === "sell"
                      ? t("limitOrders.receive")
                      : t("portfolio.buy")}
                  </p>
                  <span className="subtitle1 sm:subtitle2">
                    {expectedOutput && (
                      <>
                        {formatPretty(expectedOutput.toDec(), {
                          minimumSignificantDigits: 6,
                          maximumSignificantDigits: 6,
                          maxDecimals: 10,
                          notation: "standard",
                        })}{" "}
                        {toAsset?.coinDenom}
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="inline-flex flex-col items-end">
                  {outputDifference && (
                    <span
                      className={classNames(
                        "body2 sm:caption",
                        showOutputDifferenceWarning
                          ? "text-rust-400"
                          : "text-osmoverse-300"
                      )}
                    >{`-${outputDifference}`}</span>
                  )}
                  <span className="sm:subtitle2">
                    {formatPretty(expectedOutputFiat ?? new Dec(0), {
                      ...getPriceExtendedFormatOptions(
                        expectedOutputFiat?.toDec() ?? new Dec(0)
                      ),
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div
              className={classNames("flex flex-col py-3", {
                "text-rust-400": isBeyondOppositePrice,
              })}
            >
              <RecapRow
                left={t("limitOrders.orderType")}
                right={
                  <GenericDisclaimer
                    disabled={!isBeyondOppositePrice}
                    title={
                      <span className="caption">
                        {tab === "buy"
                          ? t("limitOrders.aboveMarket.title")
                          : t("limitOrders.belowMarket.title")}
                      </span>
                    }
                    body={
                      <span className="text-caption text-osmoverse-300">
                        {tab === "buy"
                          ? t("limitOrders.aboveMarket.description")
                          : t("limitOrders.belowMarket.description")}
                      </span>
                    }
                  >
                    <div className="sm:caption flex items-center justify-center">
                      {isBeyondOppositePrice && (
                        <Icon
                          id="alert-circle"
                          className="mr-2"
                          width={16}
                          height={16}
                        />
                      )}
                      {orderType === "limit"
                        ? t("limitOrders.limit")
                        : t("limitOrders.market")}
                    </div>
                  </GenericDisclaimer>
                }
              />
              {slippageConfig && orderType === "market" && (
                <div className="flex flex-col gap-3">
                  <RecapRow
                    left={t("swap.settings.slippage")}
                    right={
                      <div className="flex items-center justify-end">
                        <div
                          className={classNames(
                            "flex w-fit items-center justify-center overflow-hidden rounded-lg py-1.5 pl-2 text-center transition-all sm:-my-0.5 sm:h-7",
                            {
                              "border-2 border-solid border-wosmongton-300 bg-osmoverse-900 pr-2":
                                isEditingSlippage,
                            }
                          )}
                        >
                          <AutosizeInput
                            type="text"
                            inputMode="numeric"
                            minWidth={30}
                            placeholder={
                              slippageConfig?.defaultManualSlippage + "%"
                            }
                            className="sm:caption w-fit bg-transparent px-0"
                            inputClassName={classNames(
                              "!bg-transparent focus:text-center text-right placeholder:text-wosmongton-300 transition-all focus-visible:outline-none",
                              {
                                "text-rust-400": isManualSlippageTooHigh,
                              }
                            )}
                            value={manualSlippage}
                            onFocus={() => {
                              slippageConfig?.setIsManualSlippage(true);
                              setIsEditingSlippage(true);
                            }}
                            onBlur={() => {
                              if (
                                isManualSlippageTooHigh &&
                                +manualSlippage > 50
                              ) {
                                handleManualSlippageChange(
                                  (+manualSlippage).toString().split("")[0]
                                );
                              }
                              setIsEditingSlippage(false);
                            }}
                            onChange={(e) => {
                              handleManualSlippageChange(e.target.value);

                              logEvent([
                                EventName.Swap.slippageToleranceSet,
                                {
                                  fromToken: fromAsset?.coinDenom,
                                  toToken: toAsset?.coinDenom,
                                  isOnHome: true,
                                  percentage:
                                    slippageConfig?.slippage.toString(),
                                  page,
                                },
                              ]);
                            }}
                          />
                          {manualSlippage !== "" && (
                            <span
                              className={classNames({
                                "text-rust-400": isManualSlippageTooHigh,
                              })}
                            >
                              %
                            </span>
                          )}
                        </div>
                      </div>
                    }
                  />
                  {isManualSlippageTooHigh && (
                    <div className="flex items-start gap-3 rounded-3x4pxlinset border-2 border-solid border-rust-500 p-5">
                      <Icon
                        id="alert-triangle"
                        width={24}
                        height={24}
                        className="text-rust-400"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="body2 sm:caption">
                          {t("limitOrders.errors.tradeMayResultInLossOfValue")}
                        </span>
                        <span className="body2 sm:caption text-osmoverse-300">
                          {t("limitOrders.lowerSlippageToleranceRecommended")}
                        </span>
                      </div>
                    </div>
                  )}
                  {isManualSlippageTooLow && (
                    <div className="flex items-start gap-3 rounded-3x4pxlinset border-2 border-solid border-osmoverse-alpha-800/[.54] p-5">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM13.5 7.49976C13.5 8.32818 12.8284 8.99976 12 8.99976C11.1716 8.99976 10.5 8.32818 10.5 7.49976C10.5 6.67133 11.1716 5.99976 12 5.99976C12.8284 5.99976 13.5 6.67133 13.5 7.49976ZM11.25 10.4998C10.8358 10.4998 10.5 10.8355 10.5 11.2498V17.2498C10.5 17.664 10.8358 17.9998 11.25 17.9998H12.75C13.1642 17.9998 13.5 17.664 13.5 17.2498V11.2498C13.5 10.8355 13.1642 10.4998 12.75 10.4998H11.25Z"
                          fill="#736CA3"
                        />
                      </svg>
                      <div className="flex flex-col gap-1">
                        <span className="body2 sm:caption">
                          {t("limitOrders.errors.tradeMayNotExecuted")}
                        </span>
                        <span className="body2 sm:caption text-osmoverse-300">
                          {t("limitOrders.tryHigherSlippage")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {orderType === "market" && (
                <hr className="my-2 text-osmoverse-700" />
              )}
              {orderType === "market" ? (
                <RecapRow
                  left="Receive at least"
                  right={
                    <span className="sm:caption">
                      {outAmountLessSlippage &&
                        outFiatAmountLessSlippage &&
                        toAsset && (
                          <span className="text-osmoverse-100">
                            {formatPretty(outAmountLessSlippage, {
                              maxDecimals: 6,
                            })}{" "}
                            {toAsset.coinDenom}
                          </span>
                        )}{" "}
                      {outFiatAmountLessSlippage && (
                        <span className="text-osmoverse-300">
                          (~
                          {formatPretty(outFiatAmountLessSlippage, {
                            ...getPriceExtendedFormatOptions(
                              outFiatAmountLessSlippage.toDec()
                            ),
                          })}
                          )
                        </span>
                      )}
                    </span>
                  }
                />
              ) : (
                <RecapRow
                  left="Trade fee"
                  right={
                    <span className="sm:caption text-bullish-400">
                      {t("transfer.free")}
                    </span>
                  }
                />
              )}
              <RecapRow
                left={t("swap.gas.additionalNetworkFee")}
                right={
                  <>
                    {!isGasLoading ? (
                      GasEstimation
                    ) : (
                      <Skeleton className="h-5 w-16" />
                    )}
                  </>
                }
              />
            </div>
            {isBeyondOppositePrice && orderType === "limit" && (
              <div className="flex items-start gap-3 rounded-3x4pxlinset border-2 border-solid border-rust-500 p-5">
                <Icon
                  id="alert-triangle"
                  width={24}
                  height={24}
                  className="text-rust-400"
                />
                <div className="body2 sm:caption flex flex-col gap-1">
                  <span>
                    {tab === "buy"
                      ? t("limitOrders.aboveMarket.title")
                      : t("limitOrders.belowMarket.title")}
                  </span>
                  <span className="text-osmoverse-300">
                    {tab === "buy"
                      ? t("limitOrders.aboveMarket.description")
                      : t("limitOrders.belowMarket.description")}
                  </span>
                </div>
              </div>
            )}
            {!diffGteSlippage && (
              <div className="flex w-full justify-between gap-3 pt-3">
                <Button
                  mode="primary"
                  onClick={confirmAction}
                  disabled={isConfirmationDisabled}
                  className="body2 sm:caption !rounded-2xl"
                >
                  <h6>{t("limitOrders.confirm")}</h6>
                </Button>
              </div>
            )}
          </div>
        </div>
        {diffGteSlippage && (
          <div className="flex w-full px-5 pb-8">
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-osmoverse-800 p-3">
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="alert-triangle"
                  className="text-ammelia-400"
                  width={20}
                  height={17}
                />
              </div>
              <span className="subtitle1 w-full">
                {t("limitOrders.quoteUpdated")}
              </span>
              <Button
                mode="primary"
                onClick={() => restart}
                className="body2 w-fit !rounded-2xl"
              >
                <h6>{t("limitOrders.accept")}</h6>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
}
