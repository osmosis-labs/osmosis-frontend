import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import { FunctionComponent } from "react";

import { useOneClickTradingSession, useTranslation } from "~/hooks";
import { useNow } from "~/hooks/use-now";
import { displayHumanizedTime, humanizeTime } from "~/utils/date";

export const OneClickTradingRemainingTime: FunctionComponent<{
  className?: string;
  useShortTimeUnits?: boolean;
}> = ({ className, useShortTimeUnits }) => {
  const { oneClickTradingInfo, isOneClickTradingExpired } =
    useOneClickTradingSession();
  const { t } = useTranslation();

  const now = useNow();
  const humanizedTime =
    oneClickTradingInfo && now !== null
      ? humanizeTime(
          dayjs.unix(
            unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
          ),
          useShortTimeUnits,
          dayjs(now)
        )
      : undefined;

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
