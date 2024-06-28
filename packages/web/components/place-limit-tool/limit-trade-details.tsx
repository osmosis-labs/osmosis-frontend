import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import React, { FC, memo, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { PlaceLimitState } from "~/hooks/limit-orders";
import { formatPretty } from "~/utils/formatter";

interface LimitTradeDetailsProps {
  swapState: PlaceLimitState;
}

export const LimitTradeDetails: FC<LimitTradeDetailsProps> = memo(
  ({ swapState }) => {
    const { t } = useTranslation();
    const [displayInfo, setDisplayInfo] = useState<boolean>(false);
    const { makerFeeFiat /*totalFeeFiat*/ } = useMemo(() => {
      const makerFeeFiat = (
        swapState.paymentFiatValue ??
        new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0))
      ).mul(swapState.makerFee);

      const totalFeeFiat = makerFeeFiat;
      return {
        makerFeeFiat,
        totalFeeFiat,
      };
    }, [swapState.makerFee, swapState.paymentFiatValue]);

    const isLoading = useMemo(() => {
      return swapState.isMakerFeeLoading;
    }, [swapState.isMakerFeeLoading]);

    const shouldDisplayInfo = useMemo(() => {
      return !isLoading && displayInfo;
    }, [isLoading, displayInfo]);

    return (
      <div className="flex w-full flex-col">
        <div
          className="flex w-full cursor-pointer items-center justify-between"
          onClick={() => setDisplayInfo(!displayInfo && !isLoading)}
        >
          <div className="text-subtitle1">{t("limitOrders.tradeDetails")}</div>
          <div className="flex items-center justify-end text-body2 text-osmoverse-300">
            {isLoading ? (
              <div className="flex items-center text-body2 text-osmoverse-400">
                <Spinner className="mr-2" /> Estimating
              </div>
            ) : (
              <Icon
                id="chevron-down"
                className={classNames(
                  "ml-3 text-osmoverse-400 transition-transform",
                  {
                    "rotate-180": shouldDisplayInfo,
                  }
                )}
                height={12}
                width={12}
              />
            )}
          </div>
        </div>
        <div
          className={classNames(
            "flex w-full flex-col items-start overflow-hidden transition-all",
            {
              "h-0": !shouldDisplayInfo,
              "h-[105px]": shouldDisplayInfo,
            }
          )}
        >
          <div className="flex w-full items-center justify-between py-3 text-body2 text-osmoverse-300">
            <div>
              Total fees when filled ( ~
              {formatPretty(swapState.makerFee.mul(new Dec(100)), {
                maxDecimals: 2,
                minimumFractionDigits: 2,
              })}
              %)
            </div>
            <div>
              ~
              {formatPretty(makerFeeFiat, {
                maxDecimals: 2,
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <hr className="my-2 w-full text-osmoverse-700" />
          <div className="flex w-full items-center justify-between py-3 text-body2 text-osmoverse-300">
            <div>Receive</div>
            <div>
              ~
              {formatPretty(swapState.expectedFiatAmountOut, {
                maxDecimals: 2,
                minimumFractionDigits: 2,
              })}{" "}
              (
              {formatPretty(swapState.expectedTokenAmountOut, {
                maxDecimals: 2,
                minimumFractionDigits: 2,
              })}
              )
            </div>
          </div>
        </div>
      </div>
    );
  }
);
