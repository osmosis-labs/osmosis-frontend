import { truncate } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { RateRing } from "~/components/assets";
import { PoolAssetInfo } from "~/components/assets/types";
import { CustomClasses, MobileProps } from "~/components/types";

export const Token: FunctionComponent<
  PoolAssetInfo & CustomClasses & MobileProps & { ringColorIndex?: number }
> = ({
  coinDenom,
  networkName,
  poolShare,
  className,
  isMobile = false,
  ringColorIndex,
}) => {
  const justCoinDenom = coinDenom.includes("channel")
    ? coinDenom.split(" ").slice(0, 1).join("")
    : coinDenom;

  return (
    <div className={classNames("flex gap-2", className)}>
      {poolShare && !isMobile && (
        <RateRing
          className="my-auto"
          percentage={poolShare.maxDecimals(0)}
          colorIndex={ringColorIndex}
        />
      )}
      <div className="flex flex-col place-content-center text-left">
        {isMobile ? (
          <h6>{truncate(justCoinDenom)}</h6>
        ) : (
          <h5>{truncate(justCoinDenom)}</h5>
        )}
        {networkName && !isMobile && (
          <span className="subtitle2 text-osmoverse-400">{networkName}</span>
        )}
        {poolShare && isMobile && (
          <span className="caption text-osmoverse-400">
            {poolShare.maxDecimals(0).toString()}
          </span>
        )}
      </div>
    </div>
  );
};
