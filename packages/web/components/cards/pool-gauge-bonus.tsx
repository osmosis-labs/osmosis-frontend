import { FunctionComponent } from "react";
import { MetricLoader } from "../loaders";
import { LoadingProps } from "../types";

export const PoolGaugeBonusCard: FunctionComponent<
  {
    bonusValue?: string;
    days?: string;
    remainingEpochs?: string;
  } & LoadingProps
> = ({ bonusValue, days, remainingEpochs, isLoading }) => (
  <div className="flex flex-col w-full gap-2 bg-card rounded-xl py-5 px-7 border border-white-mid">
    <h5>Bonus bonding reward</h5>
    <p className="text-white-mid">
      <MetricLoader isLoading={isLoading}>
        This pool bonding over
        {days ?? "0"} will earn additional bonding incentives for
        {remainingEpochs ?? "0"} epochs.
      </MetricLoader>
    </p>
    <p className="font-caption text-lg text-secondary-200">
      <MetricLoader isLoading={isLoading}>
        Total Bonus: {bonusValue ?? "0"}
      </MetricLoader>
    </p>
  </div>
);
