import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import { FunctionComponent, useEffect, useState } from "react";

import { useOneClickTradingSession, useTranslation } from "~/hooks";
import { humanizeTime } from "~/utils/date";

export const OneClickTradingRemainingTime: FunctionComponent<{
  className?: string;
  expiredElement?: React.ReactNode;
}> = ({ className, expiredElement }) => {
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
          )
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
  }, [oneClickTradingInfo]);

  if (isOneClickTradingExpired) {
    return (
      <>
        {expiredElement ?? (
          <p className="body1 text-rust-200">
            {t("oneClickTrading.profile.sessionExpired")}
          </p>
        )}
      </>
    );
  }
  if (!humanizedTime) return null;

  return (
    <p className={classNames("body1 text-wosmongton-200", className)}>
      {humanizedTime.value} {t(humanizedTime.unitTranslationKey)}{" "}
      {t("remaining")}
    </p>
  );
};
