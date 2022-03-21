import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { PoolAssetsIcon, PoolAssetsName } from "../assets";
import { AssetInfo } from "../assets/types";
import { MetricLoader } from "../loaders";
import { PoolMetric } from "./types";

export const PoolCard: FunctionComponent<{
  poolId: string;
  poolAssets: AssetInfo[];
  poolMetrics: PoolMetric[];
}> = observer(({ poolId, poolAssets, poolMetrics }) => {
  const router = useRouter();

  return (
    <div
      className="px-[1.875rem] pt-8 pb-6 bg-card rounded-2xl cursor-pointer hover:ring-1 hover:ring-enabledGold"
      onClick={() => router.push(`/pool/${poolId}`)}
    >
      <div className="flex items-center">
        <PoolAssetsIcon assets={poolAssets} size="md" />
        <div className="ml-6 flex flex-col">
          <PoolAssetsName
            size="md"
            assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
          />
          <div className="subtitle2 text-white-mid">{`Pool #${poolId}`}</div>
        </div>
      </div>
      <div className="mt-5 mb-3 w-full bg-secondary-200 h-[1px]" />
      <div className="flex flex-wrap gap-x-8">
        {poolMetrics.map((poolMetric, index) => (
          <div key={index} className="flex flex-col">
            <div className="subtitle2 text-white-disabled">
              {poolMetric.label}
            </div>
            <MetricLoader isLoading={poolMetric.isLoading}>
              <div className="mt-0.5 subtitle1 text-white-high">
                {poolMetric.value}
              </div>
            </MetricLoader>
          </div>
        ))}
      </div>
    </div>
  );
});
