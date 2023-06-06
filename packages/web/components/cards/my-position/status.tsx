import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

export enum PositionStatus {
  InRange,
  NearBounds,
  OutOfRange,
}
export const MyPositionStatus: FunctionComponent<{
  currentPrice: Dec;
  lowerPrice: Dec;
  upperPrice: Dec;
  negative?: boolean;
}> = (props) => {
  const { currentPrice, lowerPrice, upperPrice, negative } = props;
  const t = useTranslation();

  const inRange = lowerPrice.lt(currentPrice) && upperPrice.gt(currentPrice);

  const diff = new Dec(
    Math.min(
      Number(currentPrice.sub(lowerPrice).toString()),
      Number(upperPrice.sub(currentPrice).toString())
    )
  );

  const diffPercentage = currentPrice.isZero()
    ? new Dec(0)
    : diff.quo(currentPrice).mul(new Dec(100));

  let label, status;

  if (inRange) {
    if (inRange && diffPercentage.lte(new Dec(10))) {
      status = PositionStatus.NearBounds;
      label = t("clPositions.nearBounds");
    } else {
      status = PositionStatus.InRange;
      label = t("clPositions.inRange");
    }
  } else {
    status = PositionStatus.OutOfRange;
    label = t("clPositions.outOfRange");
  }

  return (
    <div
      className={classNames(
        "flex w-fit flex-row items-center gap-[10px] rounded-[12px] px-3 py-1",
        {
          "bg-bullish-600/30": !negative && status === PositionStatus.InRange,
          "bg-ammelia-600/30":
            !negative && status === PositionStatus.NearBounds,
          "bg-rust-600/30": !negative && status === PositionStatus.OutOfRange,
        }
      )}
    >
      <div
        className={classNames("h-3 w-3 rounded-full", {
          "bg-bullish-500": status === PositionStatus.InRange,
          "bg-ammelia-600": status === PositionStatus.NearBounds,
          "bg-rust-500": status === PositionStatus.OutOfRange,
        })}
      />
      <div className="text-subtitle1">{label}</div>
    </div>
  );
};
