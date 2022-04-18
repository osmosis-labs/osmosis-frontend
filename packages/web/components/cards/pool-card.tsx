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
  } & CustomClasses
> = observer(({ poolId, poolAssets, poolMetrics, isSuperfluid, className }) => {
  const router = useRouter();
  const { isMobile } = useWindowSize();

  if (isMobile) {
    return (
      <div
        className={classNames(
          "flex items-center place-content-between w-full p-3 bg-card rounded-lg shadow-elevation-08dp",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <PoolAssetsIcon assets={poolAssets} size="sm" />

          <div className="flex flex-col gap-0.5">
            <PoolAssetsName
              className="whitespace-nowrap text-ellipsis overflow-hidden"
              size="sm"
              assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
            />
            <span className="caption text-white-disabled">Lab #{poolId}</span>
          </div>
        </div>
        <div className="flex flex-col gap-px text-right">
          {poolMetrics.map((metric, index) => (
            <span
              key={index}
              className={
                index === 0 ? "subtitle2" : "caption text-white-disabled"
              }
            >
              {metric.value} {index !== 0 && metric.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "w-full max-w-md p-px rounded-2xl hover:bg-enabledGold",
        {
          "bg-card": !isSuperfluid,
          "bg-superfluid hover:bg-none": isSuperfluid,
        }
      )}
      onClick={() => router.push(`/pool/${poolId}`)}
    >
      <div className="px-[1.875rem] pt-8 pb-6 bg-card rounded-2xl cursor-pointer">
        <div className="flex items-center">
          <PoolAssetsIcon assets={poolAssets} size="md" />
          <div className="ml-6 flex flex-col">
            <PoolAssetsName
              className="whitespace-nowrap text-ellipsis overflow-hidden"
              size="md"
              assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
            />
            <div className="subtitle2 text-white-mid">{`Pool #${poolId}`}</div>
          </div>
        </div>
        <div className="mt-5 mb-3 w-full bg-secondary-200 h-px" />
        <div className="flex flex-nowrap gap-x-8 place-content-between">
          {poolMetrics.map((poolMetric, index) => (
            <div key={index} className="flex flex-col">
              <div className="subtitle2 text-white-disabled">
                {poolMetric.label}
              </div>
              {typeof poolMetric.value === "string" ? (
                <div className="mt-0.5 subtitle1 text-white-high">
                  {poolMetric.value}
                </div>
              ) : (
                <>{poolMetric.value}</>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
