import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent } from "react";

export const AssetCell: FunctionComponent<
  Partial<{
    coinDenom: string;
    coinName: string;
    coinImageUrl: string;
    isVerified: boolean;
  }>
> = ({ coinDenom, coinName, coinImageUrl, isVerified = false }) => (
  <div
    className={classNames("flex max-w-[200px] items-center gap-4 md:gap-1", {
      "opacity-40": !isVerified,
    })}
  >
    <div className="h-10 w-10 shrink-0">
      {coinImageUrl && (
        <Image
          alt={coinDenom ?? "coin image"}
          src={coinImageUrl}
          height={40}
          width={40}
        />
      )}
    </div>
    <div className="flex w-full flex-col place-content-center">
      {coinName && (
        <div className="subtitle1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {coinName}
        </div>
      )}
      {coinDenom && (
        <span className="body2 md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
          {coinDenom}
        </span>
      )}
    </div>
  </div>
);
