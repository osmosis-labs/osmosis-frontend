import type { PositionStatus } from "@osmosis-labs/server";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";

export const MyPositionStatus: FunctionComponent<
  {
    status: PositionStatus;
    negative?: boolean;
  } & CustomClasses
> = ({ className, status, negative = false }) => {
  const { t } = useTranslation();

  let label;

  if (status === "nearBounds") label = t("clPositions.nearBounds");
  if (status === "inRange") label = t("clPositions.inRange");
  if (status === "outOfRange") label = t("clPositions.outOfRange");
  if (status === "fullRange") label = t("clPositions.fullRange");
  if (status === "unbonding") label = t("clPositions.unbonding");
  if (status === "superfluidStaked") label = t("clPositions.superfluidStaked");
  if (status === "superfluidUnstaking")
    label = t("clPositions.superfluidUnstakingStatus");

  const isSuperfluidStatus =
    status === "superfluidStaked" || status === "superfluidUnstaking";

  return (
    <div
      className={classNames(
        "flex w-fit items-center gap-[10px] rounded-xl px-3 py-1",
        {
          "bg-bullish-600/30": !negative && status === "inRange",
          "bg-ammelia-600/30": !negative && status === "nearBounds",
          "bg-rust-600/30":
            (!negative && status === "outOfRange") || status === "unbonding",
          "bg-[#2994D04D]/30": !negative && status === "fullRange",
          "bg-superfluid/30": !negative && isSuperfluidStatus,
        },
        className
      )}
    >
      <div
        className={classNames("h-3 w-3 rounded-full", {
          "bg-bullish-500": status === "inRange",
          "bg-ammelia-600": status === "nearBounds",
          "bg-rust-500": status === "outOfRange" || status === "unbonding",
          "bg-ion-400": status === "fullRange",
          "bg-superfluid": isSuperfluidStatus,
        })}
      />
      <span className="subtitle1">{label}</span>
    </div>
  );
};
