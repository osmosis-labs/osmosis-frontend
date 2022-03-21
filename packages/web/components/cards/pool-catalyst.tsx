import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";
import { MetricLoader } from "../loaders";
import { CatalystIcon } from "../assets/catalyst-icon";
import { Metric, LoadingProps } from "../types";

export const PoolCatalystCard: FunctionComponent<
  {
    colorKey?: number;
    percentDec?: string;
    tokenMinimalDenom?: string;
    metrics: Metric[];
  } & CustomClasses &
    LoadingProps
> = ({
  colorKey,
  percentDec,
  tokenMinimalDenom,
  metrics,
  className,
  isLoading,
}) => (
  <div className={classNames("min-w-fit bg-card rounded-xl p-6", className)}>
    <div className="flex gap-5">
      <CatalystIcon gradientKey={colorKey} isLoading={isLoading} />
      <div className="flex flex-col gap-1 justify-center">
        <MetricLoader isLoading={isLoading}>
          <h4>{percentDec ?? ""}</h4>
        </MetricLoader>
        <MetricLoader isLoading={isLoading}>
          <span className="text-subtitle2 text-white-mid">
            {tokenMinimalDenom ?? ""}
          </span>
        </MetricLoader>
      </div>
    </div>
    <div>
      {metrics.map(({ label, value }, index) => {
        return (
          <div key={index} className="flex flex-col gap-2 pt-4">
            <span className="text-subtitle2 text-white-mid">{label}</span>
            <MetricLoader isLoading={isLoading}>
              {typeof value === "string" ? <h6>{value}</h6> : <>{value}</>}
            </MetricLoader>
          </div>
        );
      })}
    </div>
  </div>
);
