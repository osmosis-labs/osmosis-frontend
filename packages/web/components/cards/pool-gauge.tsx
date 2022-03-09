import { FunctionComponent } from "react";
import { MetricLoader } from "../loaders";
import { LoadingProps } from "../types";

export const PoolGaugeCard: FunctionComponent<
  {
    days?: string;
    apr?: string;
    isSuperfluid?: boolean;
  } & LoadingProps
> = ({ days, apr, isLoading = false, isSuperfluid = false }) => (
  <div className="flex flex-col w-full gap-1 bg-card rounded-xl py-5 px-7">
    <h5 className="font-medium">
      <MetricLoader className="h-6" isLoading={isLoading}>
        {days ?? "0"} unbonding
      </MetricLoader>
    </h5>
    <MetricLoader className="h-6" isLoading={isLoading}>
      <p className="font-caption text-lg text-secondary-200">
        APR {apr ?? "0%"}
      </p>
    </MetricLoader>
  </div>
);
