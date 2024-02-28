import { unixNanoSecondsToSeconds } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAsync } from "react-use";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";

export const useOneClickTradingInfo = () => {
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
      setIsExpired(true);
      displayToast(
        {
          message: t("oneClickTrading.toast.oneClickTradingExpired"),
          captionElement: (
            <Button mode="text" className="caption">
              Enable 1-Click Trading
            </Button>
          ),
        },
        ToastType.ONE_CLICK_TRADING
      );
    }, timeRemaining * 1000);

    return () => clearTimeout(timeoutId);
  }, [isExpired, t, value?.info]);

  return {
    oneClickTradingInfo: value?.info,
    isOneClickTradingEnabled: value?.isEnabled,
    isOneClickTradingExpired: isExpired,
  };
};
