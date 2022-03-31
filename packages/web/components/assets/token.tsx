import { FunctionComponent } from "react";
import classNames from "classnames";
import { RateRing } from "../assets";
import { TokenInfo } from "./types";
import { CustomClasses } from "../types";

export const Token: FunctionComponent<
  TokenInfo & CustomClasses & { ringColorIndex?: number }
> = ({ coinDenom, networkName, poolShare, className, ringColorIndex }) => (
  <div className={classNames("flex gap-2", className)}>
    {poolShare && (
      <RateRing
        className="my-auto"
        percentage={poolShare}
        colorIndex={ringColorIndex}
      />
    )}
    <div className="flex flex-col place-content-center">
      <h5>{coinDenom}</h5>
      {networkName && (
        <span className="text-subtitle2 font-subtitle2 text-iconDefault">
          {networkName}
        </span>
      )}
    </div>
  </div>
);
