import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";
import { BaseCell } from "..";
import { PoolAssetsIcon, PoolAssetsName } from "../../assets";

export interface PoolCompositionCell extends BaseCell {
  poolId: string;
  poolAssets: {
    coinImageUrl: string | undefined;
    coinDenom: string;
  }[];
  isIncentivized?: boolean;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<
  Partial<PoolCompositionCell>
> = ({ poolId, poolAssets, isIncentivized = false }) => {
  const t = useTranslation();
  return (
    <div className="flex items-center">
      <PoolAssetsIcon assets={poolAssets} size="sm" />
      <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
        <PoolAssetsName
          size="sm"
          assetDenoms={poolAssets?.map((asset) => asset.coinDenom)}
        />
        <span className={classNames("text-sm font-caption opacity-60")}>
          {t("components.table.poolId", { id: poolId ? poolId : "-" })}
        </span>
      </div>
      {isIncentivized && (
        <div className="shrink-0">
          <Image
            alt="trade"
            src="/icons/trade-green-check.svg"
            height={24}
            width={24}
          />
        </div>
      )}
    </div>
  );
};
