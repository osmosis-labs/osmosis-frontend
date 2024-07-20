import { Disclosure } from "@headlessui/react";
import { Dec } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import classNames from "classnames";
import React, { FC, memo, useMemo } from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { Closer } from "~/components/swap-tool/trade-details";
import { useTranslation } from "~/hooks";
import { PlaceLimitState } from "~/hooks/limit-orders";
import { RecapRow } from "~/modals/review-limit-order";
import { formatPretty } from "~/utils/formatter";

interface LimitTradeDetailsProps {
  swapState: PlaceLimitState;
}

export const LimitTradeDetails: FC<LimitTradeDetailsProps> = memo(
  ({ swapState }) => {
    const { t } = useTranslation();

    const isLoading = useMemo(() => {
      return swapState.isMakerFeeLoading;
    }, [swapState.isMakerFeeLoading]);

    const isInAmountEmpty = useMemo(
      () => swapState?.inAmountInput.error instanceof EmptyAmountError,
      [swapState?.inAmountInput.error]
    );

    const totalFees = useMemo(() => {
      return formatPretty(swapState.makerFee.mul(new Dec(100)), {
        maxDecimals: 2,
        minimumFractionDigits: 2,
      });
    }, [swapState.makerFee]);

    return (
      <div className="flex w-full flex-col">
        <Disclosure>
          {({ open, close }) => (
            <div
              className="flex w-full flex-col transition-all"
              style={{
                height: open ? 137 : 48,
              }}
            >
              <Closer isInAmountEmpty={isInAmountEmpty} close={close} />
              <Disclosure.Button
                className={classNames(
                  "relative flex w-full items-center justify-between py-3.5 transition-opacity"
                )}
                disabled={isInAmountEmpty}
              >
                <span
                  className={classNames(
                    "body2 text-osmoverse-300 transition-opacity",
                    {
                      "opacity-0": open,
                    }
                  )}
                >
                  {t("transactions.totalFees")}
                </span>
                <span
                  className={classNames("absolute transition-opacity", {
                    "opacity-100": open,
                    "opacity-0": !open,
                  })}
                >
                  {t("limitOrders.tradeDetails")}
                </span>
                <div
                  className={classNames(
                    "absolute right-0 flex items-center gap-2 transition-opacity",
                    { "opacity-0": !isLoading }
                  )}
                >
                  <Spinner className="!h-6 !w-6 text-wosmongton-500" />
                  <span className="body2 text-osmoverse-400">
                    {t("limitOrders.estimatingFees")}
                  </span>
                </div>
                <div
                  className={classNames(
                    "flex items-center gap-2 transition-all",
                    {
                      "opacity-0": isInAmountEmpty || isLoading,
                    }
                  )}
                >
                  <span
                    className={classNames(
                      "body2 text-osmoverse-300 transition-opacity",
                      { "opacity-0": open }
                    )}
                  >
                    ~${totalFees}
                  </span>
                  <Icon
                    id="chevron-down"
                    width={16}
                    height={16}
                    className={classNames(
                      "text-osmoverse-300 transition-transform",
                      {
                        "rotate-180": open,
                      }
                    )}
                  />
                </div>
              </Disclosure.Button>
              <Disclosure.Panel className="body2 flex flex-col gap-1 text-osmoverse-300">
                <RecapRow
                  left={
                    <span>
                      {t("limitOrders.totalFeesWhenFilled")} (
                      {formatPretty(swapState.makerFee.mul(new Dec(100)), {
                        maxDecimals: 2,
                        minimumFractionDigits: 2,
                      })}
                      %)
                    </span>
                  }
                  right={
                    <span>
                      <span className="text-osmoverse-100">
                        ~
                        {formatPretty(swapState.feeUsdValue, {
                          maxDecimals: 2,
                          minimumFractionDigits: 2,
                        })}
                      </span>{" "}
                      (
                      {formatPretty(swapState.makerFee, {
                        maxDecimals: 2,
                        minimumFractionDigits: 2,
                      })}{" "}
                      {swapState.quoteAsset?.coinDenom})
                    </span>
                  }
                />
                <hr className="my-2 w-full text-osmoverse-700" />
                <RecapRow
                  left={t("limitOrders.receive")}
                  right={
                    <span className="inline-flex items-center gap-1">
                      <span className="text-osmoverse-100">
                        {formatPretty(swapState.expectedFiatAmountOut, {
                          maxDecimals: 2,
                          minimumFractionDigits: 2,
                        })}
                      </span>{" "}
                      (
                      {formatPretty(swapState.expectedTokenAmountOut, {
                        maxDecimals: 2,
                        minimumFractionDigits: 2,
                      })}
                      )
                    </span>
                  }
                />
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      </div>
    );
  }
);
