import { FunctionComponent } from "react";
import classNames from "classnames";
import { RateRing } from "../assets";
import { PoolAssetInfo } from "./types";
import { CustomClasses, MobileProps } from "../types";
import { truncateString } from "../utils";

export const Token: FunctionComponent<
  PoolAssetInfo & CustomClasses & MobileProps & { ringColorIndex?: number }
> = ({
  coinDenom,
  networkName,
  poolShare,
  className,
  isMobile = false,
  ringColorIndex,
}) => (
  <div className={classNames("flex gap-2", className)}>
    {poolShare && (
      <RateRing
        className="my-auto"
        percentage={poolShare}
        colorIndex={ringColorIndex}
      />
    )}
    <div className="flex flex-col place-content-center">
      {isMobile ? (
        <h6>{truncateString(coinDenom)}</h6>
      ) : (
        <h5>{truncateString(coinDenom)}</h5>
      )}
      {networkName && !isMobile && (
        <span className="subtitle2 text-iconDefault">{networkName}</span>
      )}
    </div>
  </div>
);
