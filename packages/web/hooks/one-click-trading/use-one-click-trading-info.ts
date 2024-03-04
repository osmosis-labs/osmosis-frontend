import type { OneClickTradingInfo } from "@osmosis-labs/stores";
import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAsync } from "react-use";

import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";

export const useOneClickTradingInfo = ({
  onExpire,
}: {
  onExpire?: (params: { oneClickTradingInfo: OneClickTradingInfo }) => void;
} = {}) => {
  const { accountStore } = useStore();
  const [isExpired, setIsExpired] = useState(false);
  const { t } = useTranslation();

  const { value } = useAsync(async () => {
    const info = await accountStore.getOneClickTradingInfo();
    const isEnabled = await accountStore.isOneCLickTradingEnabled();
    setIsExpired(await accountStore.isOneClickTradingExpired());

    return { info, isEnabled, isExpired };
  }, [accountStore, isExpired, accountStore.oneClickTradingInfo]);

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

  return {
    oneClickTradingInfo: value?.info,
    isOneClickTradingEnabled: value?.isEnabled,
    isOneClickTradingExpired: isExpired,
  };
};
