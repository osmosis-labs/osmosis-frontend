import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { PoolCell } from "./types";

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<Partial<PoolCell>> = ({
  value,
  rowHovered,
  poolId,
  tokenDenoms,
}) => (
  <React.Fragment>
    {poolId && tokenDenoms ? (
      <div className="flex gap-1">
        <div className="flex flex-col items-start text-white-full">
          <span
            className={classNames({
              "text-secondary-200": rowHovered,
            })}
          >
            {tokenDenoms.reduce(
              (str, denom, index) =>
                index === tokenDenoms.length - 1
                  ? str + denom
                  : str + denom + "/",
              ""
            )}
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
      <span>{value ?? ""}</span>
    )}
  </React.Fragment>
);
