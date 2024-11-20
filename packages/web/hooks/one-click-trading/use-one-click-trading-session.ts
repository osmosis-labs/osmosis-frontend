import type { OneClickTradingInfo } from "@osmosis-labs/stores";
import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { reaction, runInAction } from "mobx";
import { useCallback, useEffect, useState } from "react";

import { useFeatureFlags } from "~/hooks/use-feature-flags";
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
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const featureFlags = useFeatureFlags();

  const [value, setValue] = useState<{
    info: OneClickTradingInfo | undefined;
    isEnabled: boolean;
    isExpired: boolean;
  }>({
    info: undefined,
    isEnabled: false,
    isExpired: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const disposer = reaction(
      () => ({
        address: account?.address,
        oneClickTradingInfo: accountStore.oneClickTradingInfo,
        useOneClickTrading: accountStore.useOneClickTrading,
        isExpired: accountStore.hasOneClickTradingExpired,
      }),
      (data) => {
        const defaultReturn = {
          info: undefined,
          isEnabled: false,
          isExpired: false,
        };

        if (!data.address) {
          setValue(defaultReturn);
          setLoading(false);
          return;
        }

        if (data.oneClickTradingInfo?.userOsmoAddress !== data.address) {
          setValue(defaultReturn);
        } else {
          setValue({
            info: data.oneClickTradingInfo,
            isEnabled: data.useOneClickTrading,
            isExpired: data.isExpired,
          });
        }
        setLoading(false);
      },
      {
        fireImmediately: true,
      }
    );

    return () => disposer();
  }, [account?.address, accountStore]);

  useEffect(() => {
    if (value.isExpired || !value?.info) return;

    const sessionEndDate = dayjs.unix(
      unixNanoSecondsToSeconds(value.info.sessionPeriod.end)
    );
    const timeRemaining = sessionEndDate.unix() - dayjs().unix();

    const timeoutId = setTimeout(() => {
      if (!value?.info) return;

      // trigger mobx store to update when session expires
      // (isExpired is a computed value in the store)
      runInAction(() => {});

      onExpire?.({ oneClickTradingInfo: value.info });
    }, timeRemaining * 1000);

    return () => clearTimeout(timeoutId);
  }, [value.isExpired, value?.info, onExpire]);

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
    oneClickTradingInfo: featureFlags.oneClickTrading ? value?.info : undefined,
    isOneClickTradingEnabled: featureFlags.oneClickTrading
      ? value?.isEnabled
      : false,
    isOneClickTradingExpired: featureFlags.oneClickTrading
      ? value.isExpired
      : false,
    getTimeRemaining,
    getTotalSessionTime,
    isLoadingInfo: loading,
  };
};
