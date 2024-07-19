import { Dec, IntPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import { useCallback, useState } from "react";
import AutosizeInput from "react-input-autosize";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { EventName } from "~/config/analytics-events";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { ModalBase } from "~/modals";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty, getPriceExtendedFormatOptions } from "~/utils/formatter";

interface ReviewSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapState: ReturnType<typeof useSwap>;
  confirmAction: () => void;
  isConfirmationDisabled: boolean;
  slippageConfig?: ObservableSlippageConfig;
  outAmountLessSlippage?: IntPretty;
  outFiatAmountLessSlippage?: PricePretty;
  outputDifference?: RatePretty;
  showOutputDifferenceWarning?: boolean;
}

export function ReviewSwapModal({
  isOpen,
  onClose,
  swapState,
  confirmAction,
  isConfirmationDisabled,
  slippageConfig,
  outAmountLessSlippage,
  outFiatAmountLessSlippage,
  outputDifference,
  showOutputDifferenceWarning,
}: ReviewSwapModalProps) {
  const { t } = useTranslation();
  // const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics();

  const [manualSlippage, setManualSlippage] = useState("");

  const handleManualSlippageChange = useCallback(
    (value: string) => {
      if (value.length > 3) return;

      if (value == "") {
        setManualSlippage("");
        slippageConfig?.setManualSlippage(
          slippageConfig?.defaultManualSlippage
        );
        return;
      }

      setManualSlippage(value);
      slippageConfig?.setManualSlippage(new Dec(+value).toString());
    },
    [slippageConfig]
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      hideCloseButton
      className="w-[512px] rounded-2xl !p-0"
    >
      <div className="flex h-auto w-full flex-col bg-osmoverse-850">
        <div className="relative flex h-20 items-center justify-center p-4">
          <h6>{t("menu.swap")}</h6>
          <button
            onClick={onClose}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
          >
            <Icon id="thin-x" className="text-wosmongton-200" />
          </button>
        </div>
        <div className="flex flex-col px-8 pb-8">
          <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                {swapState.fromAsset && (
                  <Image
                    src={swapState.fromAsset.coinImageUrl ?? ""}
                    alt={`${swapState.fromAsset.coinDenom} image`}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                )}
                <div className="flex flex-col">
                  <p className="text-osmoverse-300">{t("limitOrders.sell")}</p>
                  <span className="subtitle1">{`${swapState.inAmountInput.inputAmount} ${swapState.fromAsset?.coinDenom}`}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {/* <span className="subtitle1 font-normal">{` .`}</span> */}
                <p className="text-osmoverse-300">
                  {formatPretty(
                    swapState.inAmountInput.fiatValue ??
                      new PricePretty(DEFAULT_VS_CURRENCY, 0),
                    {
                      ...getPriceExtendedFormatOptions(
                        swapState.inAmountInput?.fiatValue?.toDec() ??
                          new Dec(0)
                      ),
                    }
                  )}
                </p>
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
              <div className="flex flex-col items-end">
                <span
                  className={classNames(
                    "body2",
                    showOutputDifferenceWarning
                      ? "text-rust-400"
                      : "text-osmoverse-600"
                  )}
                >{`-${outputDifference}`}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                {swapState.toAsset && (
                  <Image
                    src={swapState.toAsset.coinImageUrl ?? ""}
                    alt={`${swapState.toAsset.coinDenom} image`}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                  />
                )}
                <div className="flex flex-col">
                  <p className="text-osmoverse-300">{t("portfolio.buy")}</p>
                  <span className="subtitle1">
                    {swapState.quote?.amount &&
                      formatPretty(swapState.quote?.amount.toDec(), {
                        minimumSignificantDigits: 6,
                        maximumSignificantDigits: 6,
                        maxDecimals: 10,
                        notation: "standard",
                      })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-osmoverse-300">
                  {formatPretty(swapState.tokenOutFiatValue ?? new Dec(0), {
                    ...getPriceExtendedFormatOptions(
                      swapState.tokenOutFiatValue?.toDec() ?? new Dec(0)
                    ),
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col py-3">
              {slippageConfig && (
                <RecapRow
                  left={t("swap.settings.slippage")}
                  right={
                    <div className="flex items-center justify-end">
                      <div
                        className={classNames(
                          "flex w-fit items-center justify-center overflow-hidden rounded-3xl py-1.5 px-2 text-center transition-colors hover:bg-osmoverse-825",
                          {
                            "bg-osmoverse-825":
                              slippageConfig?.isManualSlippage,
                          }
                        )}
                      >
                        <AutosizeInput
                          type="number"
                          minWidth={30}
                          placeholder={
                            slippageConfig?.defaultManualSlippage + "%"
                          }
                          className="w-fit bg-transparent px-0"
                          inputClassName="!bg-transparent text-center placeholder:text-osmoverse-300 w-[30px] transition-all"
                          value={manualSlippage}
                          onFocus={() =>
                            slippageConfig?.setIsManualSlippage(true)
                          }
                          // autoFocus={slippageConfig?.isManualSlippage}
                          onChange={(e) => {
                            handleManualSlippageChange(e.target.value);

                            logEvent([
                              EventName.Swap.slippageToleranceSet,
                              {
                                fromToken: swapState?.fromAsset?.coinDenom,
                                toToken: swapState?.toAsset?.coinDenom,
                                // isOnHome: page === "Swap Page",
                                isOnHome: true,
                                percentage: slippageConfig?.slippage.toString(),
                                page: "Swap Page",
                              },
                            ]);
                          }}
                        />
                        {manualSlippage !== "" && <span>%</span>}
                      </div>
                    </div>
                  }
                />
              )}
              <RecapRow
                left={t("limitOrders.receiveMin")}
                right={
                  <span>
                    {outAmountLessSlippage &&
                      outFiatAmountLessSlippage &&
                      swapState.toAsset && (
                        <span className="text-osmoverse-100">
                          {formatPretty(outAmountLessSlippage, {
                            maxDecimals: 6,
                          })}{" "}
                          {swapState.toAsset.coinDenom}
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
              {/* <div className="body2 flex h-8 w-full items-center justify-between">
                <span className="text-osmoverse-300">
                  {t("limitOrders.moreDetails")}
                </span>
                <span className="cursor-pointer text-wosmongton-300">
                  {t("swap.autoRouterToggle.show")}
                </span>
              </div> */}
            </div>
            {/* <div className="body2 flex h-[38px] w-full items-center justify-center">
              <span className="text-caption text-osmoverse-300">
                Disclaimer lorem ipsum.{" "}
                <a className="text-wosmongton-300">Learn more</a>
              </span>
            </div> */}
            <div className="body2 flex w-full justify-between gap-3 pt-3">
              <Button
                mode="unstyled"
                onClick={onClose}
                className="rounded-2xl border border-osmoverse-700"
              >
                <h6 className="text-wosmongton-200">
                  {t("unstableAssetsWarning.buttonCancel")}
                </h6>
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isConfirmationDisabled}
                className="!rounded-2xl"
              >
                <h6>{t("limitOrders.confirm")}</h6>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
