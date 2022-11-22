import Link from "next/link";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { PoolAssetsIcon, PoolAssetsName } from "../assets";
import { PoolAssetInfo } from "../assets/types";
import { Metric } from "../types";
import { CustomClasses } from "../types";
import { useTranslation } from "react-multi-lang";

// <Link /> notes: turn off prefetch to avoid loading tons of pools and lagging the client, many pools will be in viewport. They will still be fetched on hover.
// See : https://nextjs.org/docs/api-reference/next/link

export const PoolCard: FunctionComponent<
  {
    poolId: string;
    poolAssets: PoolAssetInfo[];
    poolMetrics: Metric[];
    isSuperfluid?: boolean;
    mobileShowFirstLabel?: boolean;
    onClick?: () => void;
  } & CustomClasses
> = observer(({ poolId, poolAssets, poolMetrics, isSuperfluid, onClick }) => {
  const t = useTranslation();

  return (
    <Link href={`/pool/${poolId}`} passHref prefetch={false}>
      <a
        className={classNames(
          "p-[2px] rounded-4xl hover:bg-wosmongton-200 text-left",
          {
            "bg-osmoverse-800": !isSuperfluid,
            "bg-superfluid hover:bg-none": isSuperfluid,
          }
        )}
        onClick={() => {
          onClick?.();
        }}
      >
        <div className="flex flex-col gap-14 place-content-between w-full h-full px-[1.875rem] pt-7 pb-6 bg-osmoverse-800 rounded-[27px] hover:bg-osmoverse-700 transition-colors cursor-pointer">
          <div className="flex items-center place-content-between">
            <PoolAssetsIcon assets={poolAssets} />
            <div className="ml-5 flex flex-col">
              <PoolAssetsName
                size="md"
                assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
              />
              <div className="subtitle1 text-white-mid">
                {t("pools.poolId", { id: poolId })}
              </div>
            </div>
          </div>
          <div className="flex place-content-between">
            {poolMetrics.map((poolMetric, index) => (
              <div key={index} className="flex flex-col gap-3">
                <span className="subtitle1 whitespace-nowrap text-white-disabled">
                  {poolMetric.label}
                </span>
                {typeof poolMetric.value === "string" ? (
                  <h6 className="mt-0.5 text-white-high">{poolMetric.value}</h6>
                ) : (
                  <>{poolMetric.value}</>
                )}
              </div>
            ))}
          </div>
        </div>
      </a>
    </Link>
  );
});
