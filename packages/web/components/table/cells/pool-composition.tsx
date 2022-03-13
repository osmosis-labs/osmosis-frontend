import { CoinPretty, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent } from "react";
import { BaseCell } from "..";
import { PoolAssetsIcon } from "../../assets";

type PoolInfo = {
  id: string;
  assets: {
    amount: CoinPretty;
    weight: IntPretty;
    weightFraction: RatePretty;
  }[];
};

export interface PoolCompositionCell extends BaseCell {
  poolInfoRaw: string;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<
  Partial<PoolCompositionCell>
> = ({ rowHovered, poolInfoRaw }) => {
  if (!poolInfoRaw) {
    return null;
  }

  const poolInfo: PoolInfo = JSON.parse(poolInfoRaw!);

  return (
    <React.Fragment>
      <div className="flex items-center">
        <PoolAssetsIcon assets={poolInfo.assets} size="sm" />
        <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
          <span
            className={classNames({
              "text-secondary-200": rowHovered,
            })}
          >
            {poolInfo.assets.length >= 3
              ? `${poolInfo.assets.length} Token Pool`
              : poolInfo.assets
                  .map((asset) => asset.amount.currency.coinDenom)
                  .join("/")}
          </span>
          <span
            className={classNames("text-sm font-caption opacity-60", {
              "text-secondary-600": rowHovered,
            })}
          >
            Pool #{poolInfo.id}
          </span>
        </div>
        <Image
          alt="trade"
          src="/icons/trade-green-check.svg"
          height={24}
          width={24}
        />
      </div>
    </React.Fragment>
  );
};
