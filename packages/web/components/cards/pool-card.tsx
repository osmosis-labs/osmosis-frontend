import classNames from "classnames";
import Link from "next/link";
import { FunctionComponent } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { PoolAssetInfo } from "~/components/assets/types";
import { CustomClasses } from "~/components/types";
import { Metric } from "~/components/types";
import { useTranslation } from "~/hooks";

export const PoolCard: FunctionComponent<
  {
    poolId: string;
    poolAssets: PoolAssetInfo[];
    poolMetrics: Metric[];
    isSuperfluid?: boolean;
    isSupercharged?: boolean;
    mobileShowFirstLabel?: boolean;
    onClick?: () => void;
  } & CustomClasses
> = ({
  poolId,
  poolAssets,
  poolMetrics,
  isSuperfluid,
  isSupercharged,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <Link
      href={`/pool/${poolId}`}
      passHref
      className={classNames(
        "rounded-4xl p-[2px] text-left hover:bg-wosmongton-200",
        {
          "bg-osmoverse-800": !isSuperfluid,
          "bg-superfluid hover:bg-none": isSuperfluid,
        }
      )}
      onClick={() => {
        onClick?.();
      }}
    >
      <div className="flex h-full w-full cursor-pointer flex-col place-content-between gap-14 rounded-[1.688rem] bg-osmoverse-800 px-9 py-7 transition-colors hover:bg-osmoverse-700">
        <div className="flex place-content-between items-center">
          <PoolAssetsIcon assets={poolAssets} />
          <div className="ml-5 flex flex-col">
            <PoolAssetsName
              size="md"
              assetDenoms={poolAssets.map((asset) => asset.coinDenom)}
            />
            <div className="subtitle1 flex items-center gap-1 text-white-mid">
              {t("pools.poolId", { id: poolId })}
              {isSupercharged && (
                <Icon id="lightning-small" height={16} width={16} />
              )}
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
    </Link>
  );
};
