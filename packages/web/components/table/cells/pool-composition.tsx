import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent } from "react";

import { PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { Icon } from "~/components/assets";
import { BaseCell } from "~/components/table";
import { useTranslation } from "~/hooks";
export interface PoolCompositionCell extends BaseCell {
  poolId: string;
  poolAssets: {
    coinImageUrl: string | undefined;
    coinDenom: string;
  }[];
  stableswapPool: boolean;
  superchargedPool: boolean;
  transmuterPool: boolean;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<
  Partial<PoolCompositionCell>
> = ({
  poolId,
  poolAssets,
  stableswapPool,
  superchargedPool,
  transmuterPool,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <PoolAssetsIcon assets={poolAssets} size="sm" />
      <div className="flex items-center gap-1.5 text-ion-400">
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
        {superchargedPool && (
          <Icon id="lightning-small" height={24} width={24} />
        )}
        {transmuterPool && (
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
