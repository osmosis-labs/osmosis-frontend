import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { useOneClickTradingSession, useTranslation } from "~/hooks";
import { humanizeTime } from "~/utils/date";

export const OneClickTradingRemainingTime = () => {
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
      1_000 // Update every 3 seconds
    );

    return () => clearInterval(intervalId);
  }, [oneClickTradingInfo]);

  if (isOneClickTradingExpired)
    return (
      <p className="body1 text-rust-200">
        {t("oneClickTrading.profile.sessionExpired")}
      </p>
    );
  if (!humanizedTime) return null;

  return (
    <p className="body1 text-wosmongton-200">
      {humanizedTime.value} {t(humanizedTime.unitTranslationKey)}{" "}
      {t("remaining")}
    </p>
  );
};
