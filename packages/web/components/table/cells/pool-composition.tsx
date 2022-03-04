import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { BaseCell } from "..";
import { useStore } from "../../../stores";
import { PoolAssetsIcon } from "../../assets";
import { PricePretty } from "@keplr-wallet/unit";

export interface PoolCompositionCell extends BaseCell {
  poolId: string;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<PoolCompositionCell> = ({
  value,
  rowHovered,
  poolId,
}) => {
  const { queriesOsmosisStore, chainStore } = useStore();

  const queryOsmosis = queriesOsmosisStore.get(chainStore.osmosis.chainId);

  const pool = queryOsmosis.queryGammPools.getPool(poolId);

  return (
    <React.Fragment>
      {pool ? (
        <div className="flex items-center">
          <PoolAssetsIcon assets={pool.poolAssets} size="sm" />
          <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
            <span
              className={classNames({
                "text-secondary-200": rowHovered,
              })}
            >
              {pool.poolAssets.length >= 3
                ? `${pool.poolAssets.length} Token Pool`
                : pool.poolAssets
                    .map((asset) => asset.amount.currency.coinDenom)
                    .join("/")}
            </span>
            <span
              className={classNames("text-sm font-caption opacity-60", {
                "text-secondary-600": rowHovered,
              })}
            >
              Pool #{poolId}
            </span>
          </div>
          <Image
            alt="trade"
            src="/icons/trade-green-check.svg"
            height={24}
            width={24}
          />
        </div>
      ) : (
        <span>{value?.toString() ?? "No pool"}</span>
      )}
    </React.Fragment>
  );
};
