import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ellipsisText } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { useWindowSize } from "~/hooks/window/use-window-size";
import { ModalBase } from "~/modals";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty } from "~/utils/formatter";

interface ReviewSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapState: ReturnType<typeof useSwap>;
  confirmAction: () => void;
}

export function ReviewSwapModal({
  isOpen,
  onClose,
  swapState,
  confirmAction,
}: ReviewSwapModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

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
                  <span className="subtitle1">
                    {swapState.fromAsset?.coinName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-osmoverse-300">
                  {formatPretty(
                    swapState.inAmountInput.fiatValue ??
                      new PricePretty(DEFAULT_VS_CURRENCY, 0)
                  )}
                </p>
                <span className="subtitle1 font-normal">
                  {`${swapState.inAmountInput.inputAmount} ${swapState.fromAsset?.coinDenom}`}
                </span>
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
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.estimatedFees")}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="body2 text-osmoverse-300">
                  ~${formatPretty(swapState.totalFee)}
                </span>
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
                    {swapState.toAsset?.coinName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-osmoverse-300">
                  {formatPretty(swapState.tokenOutFiatValue ?? new Dec(0))}
                </p>
                <span className="subtitle1 font-normal">
                  {swapState.quote?.amount &&
                    formatPretty(swapState.quote?.amount)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col py-3">
              <RecapRow
                left={t("limitOrders.expectedRate")}
                right={
                  <span
                    className={classNames(
                      "body2 text-osmoverse-100 transition-opacity",
                      {
                        "opacity-50":
                          swapState.isQuoteLoading ||
                          swapState.inAmountInput.isTyping,
                      }
                    )}
                  >
                    1{" "}
                    <span title={swapState.fromAsset?.coinDenom}>
                      {ellipsisText(
                        swapState.fromAsset?.coinDenom ?? "",
                        isMobile ? 11 : 20
                      )}
                    </span>{" "}
                    {`≈ ${
                      swapState.toAsset
                        ? formatPretty(
                            swapState.inBaseOutQuoteSpotPrice ?? new Dec(0),
                            {
                              maxDecimals: Math.min(
                                swapState.toAsset.coinDecimals,
                                8
                              ),
                            }
                          )
                        : "0"
                    }`}
                  </span>
                }
              />
              <RecapRow left={t("limitOrders.receiveMin")} right={<></>} />
              <div className="body2 flex h-8 w-full items-center justify-between">
                <span className="text-osmoverse-300">
                  {t("limitOrders.moreDetails")}
                </span>
                <span className="cursor-pointer text-wosmongton-300">
                  {t("swap.autoRouterToggle.show")}
                </span>
              </div>
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
                className="rounded-xl border border-osmoverse-700"
              >
                <h6 className="text-wosmongton-200">
                  {t("unstableAssetsWarning.buttonCancel")}
                </h6>
              </Button>
              <Button onClick={confirmAction}>
                <h6>{t("limitOrders.confirm")}</h6>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
