import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, MobileProps } from "../types";
import { MetricLoader } from "../loaders";
import { CatalystIcon } from "../assets/catalyst-icon";
import { Metric, LoadingProps } from "../types";
import { truncateString } from "../utils";

export const PoolCatalystCard: FunctionComponent<
  {
    colorKey?: number;
    percentDec?: string;
    tokenDenom?: string;
    metrics: Metric[];
  } & CustomClasses &
    LoadingProps &
    MobileProps
> = ({
  colorKey,
  percentDec,
  tokenDenom,
  metrics,
  className,
  isLoading,
  isMobile,
}) => (
  <div
    className={classNames("min-w-fit bg-card rounded-xl p-6 md:p-5", className)}
  >
    <div className="flex gap-5">
      <CatalystIcon
        gradientKey={colorKey}
        isLoading={isLoading}
        isMobile={isMobile}
      />
      <div className="flex flex-col gap-1 justify-center">
        <MetricLoader isLoading={isLoading}>
          {isMobile ? <h5>{percentDec ?? ""}</h5> : <h4>{percentDec ?? ""}</h4>}
        </MetricLoader>
        <MetricLoader isLoading={isLoading}>
          <span className="text-subtitle2 md:body2 text-white-mid">
            {truncateString(tokenDenom ?? "", 28)}
          </span>
        </MetricLoader>
      </div>
    </div>
    <div>
      {metrics.map(({ label, value }, index) => {
        return (
          <div key={index} className="flex flex-col gap-2 pt-4">
            <span className="text-subtitle2 md:caption text-white-mid">
              {label}
            </span>
            <MetricLoader isLoading={isLoading}>
              {typeof value === "string" ? (
                isMobile ? (
                  <span className="subtitle2">{value}</span>
                ) : (
                  <h6>{value}</h6>
                )
              ) : (
                <>{value}</>
              )}
            </MetricLoader>
          </div>
        );
      })}
    </div>
  </div>
);
