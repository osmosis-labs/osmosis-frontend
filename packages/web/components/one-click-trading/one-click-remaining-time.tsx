import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import { FunctionComponent, useEffect, useState } from "react";

import { useOneClickTradingSession, useTranslation } from "~/hooks";
import { displayHumanizedTime, humanizeTime } from "~/utils/date";

export const OneClickTradingRemainingTime: FunctionComponent<{
  className?: string;
  useShortTimeUnits?: boolean;
}> = ({ className, useShortTimeUnits }) => {
  const { oneClickTradingInfo, isOneClickTradingExpired } =
    useOneClickTradingSession();
  const { t } = useTranslation();

  const [humanizedTime, setHumanizedTime] =
    useState<ReturnType<typeof humanizeTime>>();

  useEffect(() => {
    if (!oneClickTradingInfo) return setHumanizedTime(undefined);

    const updateTime = () => {
      setHumanizedTime(
        humanizeTime(
          dayjs.unix(
            unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
          ),
          useShortTimeUnits
        )
      );
    };

    updateTime();

    const intervalId = setInterval(
      () => {
        updateTime();
      },
      1_000 // Update every second
    );

    return () => clearInterval(intervalId);
  }, [oneClickTradingInfo, useShortTimeUnits]);

  if (isOneClickTradingExpired) {
    return (
      <p className="body1 text-osmoverse-300">
        {t("oneClickTrading.profile.sessionExpired")}
      </p>
    );
  }

  if (!humanizedTime) return null;

  return (
    <p className={classNames("body1 text-wosmongton-200", className)}>
      {displayHumanizedTime({
        humanizedTime,
        t,
        delimitedBy: useShortTimeUnits ? " " : undefined,
      })}{" "}
      {t("remaining")}
    </p>
  );
};
