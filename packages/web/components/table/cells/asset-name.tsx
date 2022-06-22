import Image from "next/image";
import React, { FunctionComponent } from "react";
import { AssetCell as Cell } from "./types";
import { InfoTooltip } from "../../tooltip";
import { UNSTABLE_MSG } from "../../../config";

export const AssetNameCell: FunctionComponent<Partial<Cell>> = ({
  coinDenom,
  chainName,
  coinImageUrl,
  isCW20 = false,
  isUnstable,
}) =>
  coinDenom ? (
    <div className="flex items-center gap-4">
      <div>
        {coinImageUrl && (
          <Image alt={coinDenom} src={coinImageUrl} height={40} width={40} />
        )}
      </div>
      <div className="flex flex-col place-content-center">
        <div className="flex">
          <span className="subtitle1 text-white-high">{coinDenom}</span>
          {isCW20 && (
            <div className="ml-2 px-2 py-1 rounded-full font-title text-xs bg-primary-200">
              CW20
            </div>
          )}
        </div>
        {chainName && (
          <span className="body2 text-iconDefault">{chainName}</span>
        )}
      </div>
      {isUnstable && (
        <InfoTooltip style="secondary-200" content={UNSTABLE_MSG} />
      )}
    </div>
  ) : (
    <span>{coinDenom}</span>
  );
