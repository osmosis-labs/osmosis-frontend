import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import classNames from "classnames";
import Image from "next/image";

import { Switch } from "~/components/ui/switch";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

interface Props {
  onRequestOptions?: () => void;
  spendLimit: OneClickTradingTransactionParams["spendLimit"];
  isOneClickEnabled: OneClickTradingTransactionParams["isOneClickEnabled"];
  sessionPeriod: OneClickTradingTransactionParams["sessionPeriod"];
  setIsOneClickEnabled: (v: boolean) => void;
}

export const OneClickTradingCallToAction: React.FC<Props> = ({
  onRequestOptions,
  isOneClickEnabled,
  sessionPeriod,
  spendLimit,
  setIsOneClickEnabled,
}) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const handleToggle = () => {
    if (isOneClickEnabled) {
      logEvent([EventName.OneClickTrading.enableOneClickTrading]);
    }
    setIsOneClickEnabled(!isOneClickEnabled);
  };

  return (
    <div className="flex w-full flex-col gap-2 py-3">
      <div
        className={classNames(
          "group flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-osmoverse-alpha-800/[.54] p-4"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4">
          <Image
            src="/images/1ct-medium-icon.svg"
            alt="1-Click trading icon"
            width={48}
            height={48}
          />
          <div className="flex flex-col gap-1">
            <p>{t("oneClickTrading.reviewSwapModal.title")}</p>
            <p className="body2 text-osmoverse-300">
              {t("oneClickTrading.reviewSwapModal.subtitle")}
            </p>
          </div>
        </div>
        <Switch checked={isOneClickEnabled} />
      </div>
      {isOneClickEnabled ? (
        <p className="text-sm">
          <span className="text-osmoverse-300">
            {t("oneClickTrading.reviewSwapModal.details", {
              time: t(
                `oneClickTrading.settings.sessionPeriodScreen.periods.${sessionPeriod?.end}`
              ),
              limit: spendLimit?.toString() || "$5,000 USD",
            })}
          </span>
          <span
            className="cursor-pointer text-wosmongton-300"
            onClick={onRequestOptions}
          >
            {t("change")}
          </span>
        </p>
      ) : null}
    </div>
  );
};
