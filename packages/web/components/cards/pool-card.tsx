import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { PoolAssetsIcon, PoolAssetsName } from "../assets";
import { PoolAssetInfo } from "../assets/types";
import { Metric } from "../types";
import { CustomClasses } from "../types";
import { useWindowSize } from "../../hooks";

export const PoolCard: FunctionComponent<
  {
    poolId: string;
    poolAssets: PoolAssetInfo[];
    poolMetrics: Metric[];
    isSuperfluid?: boolean;
    mobileShowFirstLabel?: boolean;
  } & CustomClasses
> = observer(
  ({
    poolId,
    poolAssets,
    poolMetrics,
    isSuperfluid,
    mobileShowFirstLabel = false,
    className,
  }) => {
    const router = useRouter();
    const { isMobile } = useWindowSize();

    if (isMobile) {
      return (
        <div
          className={classNames(
            "w-full h-32 p-px rounded-lg shadow-elevation-08dp",
            {
              "bg-card": !isSuperfluid,
              "bg-superfluid": isSuperfluid,
            },
            className
          )}
          onClick={() => router.push(`/pool/${poolId}`)}
        >
          <div className="flex items-center place-content-between w-full h-full p-8 bg-card rounded-lginset">
            <div className="flex flex-col place-items-start gap-3">
              <PoolAssetsIcon assets={poolAssets} size="sm" />

              <div className="flex flex-col gap-0.5">
                <PoolAssetsName
                  className="whitespace-nowrap text-ellipsis overflow-hidden"
                  size="sm"
                  assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
                />
                <span className="caption text-white-disabled">
                  Pool #{poolId}
                </span>
              </div>
            </div>
            <div className="flex flex-col h-full place-content-between text-right">
              {poolMetrics.map((metric, index) => (
                <span
                  key={index}
                  className={classNames(
                    "flex items-center place-content-end",
                    index === 0 ? "subtitle2" : "caption text-white-disabled"
                  )}
                >
                  {metric.value}{" "}
                  {(mobileShowFirstLabel || index !== 0) && metric.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <button
        className={classNames(
          "w-full max-w-md p-px rounded-2xl hover:bg-enabledGold text-left",
          {
            "bg-card": !isSuperfluid,
            "bg-superfluid hover:bg-none": isSuperfluid,
          }
        )}
        onClick={() => router.push(`/pool/${poolId}`)}
      >
        <div className="flex flex-col place-content-between w-full h-full px-[1.875rem] pt-7 pb-6 bg-card rounded-2xlinset cursor-pointer">
          <div className="flex items-center">
            <PoolAssetsIcon assets={poolAssets} size="md" />
            <div className="ml-5 flex flex-col">
              <PoolAssetsName
                size="md"
                assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
              />
              <div className="subtitle2 text-white-mid">{`Pool #${poolId}`}</div>
            </div>
          </div>
          <hr className="mt-5 mb-3 w-full text-secondary-200 h-px" />
          <div className="flex place-content-between">
            {poolMetrics.map((poolMetric, index) => (
              <div key={index} className="flex flex-col">
                <span className="subtitle2 whitespace-nowrap text-white-disabled">
                  {poolMetric.label}
                </span>
                {typeof poolMetric.value === "string" ? (
                  <span className="mt-0.5 subtitle1 text-white-high">
                    {poolMetric.value}
                  </span>
                ) : (
                  <>{poolMetric.value}</>
                )}
              </div>
            ))}
          </div>
        </div>
      </button>
    );
  }
);
