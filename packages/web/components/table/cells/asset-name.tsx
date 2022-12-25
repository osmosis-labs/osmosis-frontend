import Image from "next/image";
import React, { FunctionComponent, useState } from "react";
import { AssetCell as Cell } from "./types";
import { InfoTooltip } from "../../tooltip";
import { UNSTABLE_MSG } from "../../../config";

export const AssetNameCell: FunctionComponent<Partial<Cell>> = ({
  coinDenom,
  chainName,
  coinImageUrl,
  isUnstable,
  isFavorite,
  onToggleFavorite,
}) => {
  const [showStar, setShowStar] = useState(false);
  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => setShowStar(true)}
      onMouseLeave={() => setShowStar(false)}
    >
      {showStar || isFavorite ? (
        <div className="cursor-pointer">
          <Image
            alt="star"
            onClick={onToggleFavorite}
            src={`/icons/star${isFavorite ? "-filled" : ""}.svg`}
            height={24}
            width={24}
          />
        </div>
      ) : (
        <div style={{ height: 24, width: 24 }} />
      )}
      {coinDenom ? (
        <div className="flex items-center gap-4">
          <div>
            {coinImageUrl && (
              <Image
                alt={coinDenom}
                src={coinImageUrl}
                height={40}
                width={40}
              />
            )}
          </div>
          <div className="flex flex-col place-content-center">
            <div className="flex">
              <span className="subtitle1 text-white-high">{coinDenom}</span>
            </div>
            {chainName && (
              <span className="body2 text-osmoverse-400">{chainName}</span>
            )}
          </div>
          {isUnstable && <InfoTooltip content={UNSTABLE_MSG} />}
        </div>
      ) : (
        <span>{coinDenom}</span>
      )}
    </div>
  );
};
