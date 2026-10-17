import type { OneClickTradingInfo } from "@osmosis-labs/tx";
import { safeTimeout, unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useWallet } from "~/hooks/use-wallet";

/**
 * This hook manages and provides information about the one-click trading session.
 *
 * This hook encapsulates the logic for fetching one-click trading session information,
 * determining if the session is enabled and if it has expired. It also provides utility
 * functions to calculate the remaining time for the session and the total session time.
 */
export const useOneClickTradingSession = ({
  onExpire,
}: {
  // Optional callback function that gets called when the trading session expires.
  onExpire?: (params: { oneClickTradingInfo: OneClickTradingInfo }) => void;
} = {}) => {
  const [expiredSession, setExpiredSession] = useState<OneClickTradingInfo>();
  const { address, oneClickTradingInfo, useOneClickTrading, isStateHydrated } =
    useWallet();
  const featureFlags = useFeatureFlags();

  const info =
    address && oneClickTradingInfo?.userOsmoAddress === address
      ? oneClickTradingInfo
      : undefined;
  const expired =
    !!info &&
    dayjs
      .unix(unixNanoSecondsToSeconds(info.sessionPeriod.end))
      .isBefore(dayjs());

  const isExpired = expired || (!!info && expiredSession === info);

  // Set a timeout to update the isExpired state
  useEffect(() => {
    if (isExpired || !info) return;

    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(info.sessionPeriod.end)
    );
    const timeRemainingSeconds = sessionEndDate.unix() - dayjs().unix();

    const { clear } = safeTimeout(() => {
      setExpiredSession(info);
      onExpire?.({ oneClickTradingInfo: info });
    }, timeRemainingSeconds * 1000);

    return () => clear();
  }, [isExpired, info, onExpire]);

  const getTimeRemaining = useCallback(() => {
    const oneClickTradingInfo = info;
    if (!oneClickTradingInfo) return 0;
    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
    );

    return sessionEndDate.unix() - dayjs().unix();
  }, [info]);

  const getTotalSessionTime = useCallback(() => {
    const oneClickTradingInfo = info;
    if (!oneClickTradingInfo) return 0;
    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
    );

    return sessionEndDate.unix() - oneClickTradingInfo.sessionStartedAtUnix;
  }, [info]);

  return {
    oneClickTradingInfo: featureFlags.oneClickTrading ? info : undefined,
    isOneClickTradingEnabled: featureFlags.oneClickTrading
      ? !!info && useOneClickTrading && !isExpired
      : false,
    isOneClickTradingExpired: featureFlags.oneClickTrading ? isExpired : false,
    getTimeRemaining,
    getTotalSessionTime,
    isLoadingInfo: !isStateHydrated,
  };
};
