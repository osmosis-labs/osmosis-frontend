import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";
import { MetricLoader } from "../loaders";
import { LoadingProps, MobileProps } from "../types";

export const PoolGaugeBonusCard: FunctionComponent<
  {
    bonusValue?: string;
    days?: string;
    remainingEpochs?: string;
  } & LoadingProps &
    MobileProps
> = ({ bonusValue, days, remainingEpochs, isLoading, isMobile = false }) => {
  const t = useTranslation();

  return (
    <div className="flex flex-col w-full min-w-[220px] gap-1 bg-card rounded-xl md:pl-[30%] md:p-3.5 py-5 px-7 border border-white-mid">
      {isMobile ? (
        <span className="subtitle1">
          {t("pool.gauges.bonus.titleMobile", { days: days ?? "0" })}
        </span>
      ) : (
        <h5>{t("pool.gauges.bonus.title")}</h5>
      )}
      {!isMobile && (
        <p className="text-white-mid">
          <MetricLoader isLoading={isLoading}>
            {t("pool.gauges.bonus.info", {
              days: days ?? "0",
              remainingEpochs: remainingEpochs ?? "0",
            })}
          </MetricLoader>
        </p>
      )}
      <p className="font-caption text-lg text-secondary-200 md:subtitle2">
        <MetricLoader
          className="h-6 md:h-4"
          isLoading={isLoading || !bonusValue}
        >
          {isMobile
            ? t("pool.gauges.bonus.remainingMobile")
            : t("pool.gauges.bonus.remaining")}{" "}
          {bonusValue ?? "0"}
        </MetricLoader>
      </p>
      {isMobile && remainingEpochs && !isLoading && (
        <span className="subtitle2 text-secondary-200">
          {t("pool.gauges.bonus.remainingEpochs", { remainingEpochs })}
        </span>
      )}
    </div>
  );
};
