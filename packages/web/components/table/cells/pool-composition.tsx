import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { BaseCell } from "~/components/table";

export interface PoolCompositionCell extends BaseCell {
  poolId: string;
  poolAssets: {
    coinImageUrl: string | undefined;
    coinDenom: string;
  }[];
  stableswapPool: boolean;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<
  Partial<PoolCompositionCell>
> = ({ poolId, poolAssets, stableswapPool }) => {
  const t = useTranslation();
  return (
    <div className="flex items-center">
      <PoolAssetsIcon assets={poolAssets} size="sm" />
      <div className="flex items-center gap-1.5">
        <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
          <PoolAssetsName
            size="sm"
            assetDenoms={poolAssets?.map((asset) => asset.coinDenom)}
          />
          <span className={classNames("text-sm font-caption opacity-60")}>
            {t("components.table.poolId", { id: poolId ? poolId : "-" })}
          </span>
        </div>
        {stableswapPool && (
          <Image
            alt=""
            src="/icons/stableswap-pool.svg"
            width={24}
            height={24}
          />
        )}
      </div>
    </div>
  );
};
