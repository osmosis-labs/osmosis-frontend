import { Dec, Int } from "@keplr-wallet/unit";
import type { MappedLimitOrder } from "@osmosis-labs/server";
import classNames from "classnames";
import React, { useMemo } from "react";

import { ProgressBar } from "~/components/ui/progress-bar";
import { formatPretty } from "~/utils/formatter";

interface OrderProgressBarProps {
  order: MappedLimitOrder;
  totalPercentClassNames?: string;
}

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({
  order,
  totalPercentClassNames,
}) => {
  const { percentFilled, status } = order;

  const roundedAmountFilled = useMemo(() => {
    if (percentFilled.lt(new Dec(0.01)) && !percentFilled.isZero()) {
      return new Int(1);
    }
    return percentFilled.mul(new Dec(100)).truncate();
  }, [percentFilled]);

  const progressSegments = useMemo(
    () => [
      {
        percentage: roundedAmountFilled.toString(),
        classNames: "bg-bullish-400",
      },
    ],
    [roundedAmountFilled]
  );

  if (status !== "partiallyFilled" && status !== "open") {
    return;
  }

  return (
    <ProgressBar
      segments={progressSegments}
      classNames="h-[8px] w-[64px]"
      totalPercentClassNames={classNames(
        {
          "text-bullish-400": percentFilled.gt(new Dec(0)),
          "text-osmoverse-500": !percentFilled.gt(new Dec(0)),
        },
        totalPercentClassNames
      )}
      totalPercent={formatPretty(roundedAmountFilled, {
        maxDecimals: 0,
      })}
    />
  );
};
