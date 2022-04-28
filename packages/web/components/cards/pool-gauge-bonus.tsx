import { FunctionComponent } from "react";
import { MetricLoader } from "../loaders";
import { LoadingProps, MobileProps } from "../types";

export const PoolGaugeBonusCard: FunctionComponent<
  {
    bonusValue?: string;
    days?: string;
    remainingEpochs?: string;
  } & LoadingProps &
    MobileProps
> = ({ bonusValue, days, remainingEpochs, isLoading, isMobile = false }) => (
  <div className="flex flex-col w-full gap-1 bg-card rounded-xl md:pl-[30%] md:p-3.5 py-5 px-7 border border-white-mid">
    {isMobile ? (
      <span className="subtitle1">{`${days} bonus reward`}</span>
    ) : (
      <h5>Bonus bonding reward</h5>
    )}
    {!isMobile && (
      <p className="text-white-mid">
        <MetricLoader isLoading={isLoading}>
          This pool bonding over {days ?? "0"} will earn additional bonding
          incentives for {remainingEpochs ?? "0"} days.
        </MetricLoader>
      </p>
    )}
    <p className="font-caption text-lg text-secondary-200 md:subtitle2">
      <MetricLoader className="h-6 md:h-4" isLoading={isLoading || !bonusValue}>
        {isMobile ? "Bonus:" : "Total Bonus:"} {bonusValue ?? "0"}
      </MetricLoader>
    </p>
    {isMobile && remainingEpochs && !isLoading && (
      <span className="subtitle2 text-secondary-200">
        {remainingEpochs} days remaining
      </span>
    )}
  </div>
);
