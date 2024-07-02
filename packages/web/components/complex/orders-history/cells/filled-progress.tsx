import { Dec, Int } from "@keplr-wallet/unit";
import { MappedLimitOrder } from "@osmosis-labs/trpc";
import React, { useMemo } from "react";

import { ProgressBar } from "~/components/ui/progress-bar";
import { formatPretty } from "~/utils/formatter";

interface OrderProgressBarProps {
  order: MappedLimitOrder;
}

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({
  order,
}) => {
  const { percentFilled, status } = order;

  const roundedAmountFilled = useMemo(() => {
    if (percentFilled.lt(new Dec(0.01)) && !percentFilled.isZero()) {
      return new Int(1);
    }
    return percentFilled.mul(new Dec(100)).round();
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
      totalPercent={formatPretty(roundedAmountFilled, {
        maxDecimals: 0,
      })}
    />
  );
};
