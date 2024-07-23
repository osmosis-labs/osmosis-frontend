import { Dec } from "@keplr-wallet/unit";
import { EmptyAmountError } from "@osmosis-labs/keplr-hooks";
import classNames from "classnames";
import React, { FC, memo, useMemo } from "react";

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
      <div className="flex w-full flex-col py-2">
        <RecapRow
          left={<span>Trade fees (when order filled)</span>}
          right={<span className="text-bullish-400">{t("transfer.free")}</span>}
        />
        <RecapRow
          left="Additional network fees"
          right={
            <span
              className={classNames("inline-flex items-center gap-1", {
                "animate-pulse": isLoading,
                "opacity-50": isInAmountEmpty,
              })}
            >
              ~${totalFees}
            </span>
          }
        />
      </div>
    );
  }
);
