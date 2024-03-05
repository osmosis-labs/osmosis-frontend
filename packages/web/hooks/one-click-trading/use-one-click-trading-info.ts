import type { OneClickTradingInfo } from "@osmosis-labs/stores";
import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useAsync } from "react-use";

import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";

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
  const { accountStore, chainStore } = useStore();
  const [isExpired, setIsExpired] = useState(false);
  const { t } = useTranslation();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const { value } = useAsync(async () => {
    const defaultReturn = {
      info: undefined,
      isEnabled: false,
      isExpired: false,
    };

    if (!account?.address) {
      return defaultReturn;
    }

    const info = await accountStore.getOneClickTradingInfo();
    const isEnabled = await accountStore.isOneCLickTradingEnabled();
    setIsExpired(await accountStore.isOneClickTradingExpired());

    if (info?.userOsmoAddress !== account?.address) {
      setIsExpired(false);
      return defaultReturn;
    }

    return { info, isEnabled, isExpired };
  }, [
    accountStore,
    isExpired,
    accountStore.oneClickTradingInfo,
    account?.address,
  ]);

  // Set a timeout to update the isExpired state
  useEffect(() => {
    if (isExpired || !value?.info) return;

    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(value.info.sessionPeriod.end)
    );
    const timeRemaining = sessionEndDate.unix() - dayjs().unix();

    const timeoutId = setTimeout(() => {
      if (!value?.info) return;

      setIsExpired(true);
      onExpire?.({ oneClickTradingInfo: value.info });
    }, timeRemaining * 1000);

    return () => clearTimeout(timeoutId);
  }, [isExpired, t, value?.info, onExpire]);

  const getTimeRemaining = useCallback(() => {
    const oneClickTradingInfo = value?.info;
    if (!oneClickTradingInfo) return 0;
    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
    );

    return sessionEndDate.unix() - dayjs().unix();
  }, [value?.info]);

  const getTotalSessionTime = useCallback(() => {
    const oneClickTradingInfo = value?.info;
    if (!oneClickTradingInfo) return 0;
    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(oneClickTradingInfo.sessionPeriod.end)
    );

    return sessionEndDate.unix() - oneClickTradingInfo.sessionStartedAtUnix;
  }, [value?.info]);

  return {
    oneClickTradingInfo: value?.info,
    isOneClickTradingEnabled: value?.isEnabled,
    isOneClickTradingExpired: isExpired,
    getTimeRemaining,
    getTotalSessionTime,
  };
};
