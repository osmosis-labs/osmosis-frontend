import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { PoolAssetsIcon } from "../../assets";
import { PoolCompositionCell as Cell } from "./types";

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<Partial<Cell>> = ({
  rowHovered,
  poolId,
  poolAssets,
}) => {
  return (
    <div className="flex items-center">
      <PoolAssetsIcon assets={poolAssets} size="sm" />
      <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
        <span
          className={classNames({
            "text-secondary-200": rowHovered,
          })}
        >
          {poolAssets &&
            (poolAssets.length >= 3
              ? `${poolAssets.length} Token Pool`
              : poolAssets.map((asset) => asset.coinDenom).join("/"))}
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
  );
};
