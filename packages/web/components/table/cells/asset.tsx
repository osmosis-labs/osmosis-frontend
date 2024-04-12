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
    className={classNames("group flex items-center gap-2 md:gap-1", {
      "opacity-40": !isVerified,
    })}
  >
    <div className="flex items-center gap-4 md:gap-2">
      <div className="h-10 w-10">
        {coinImageUrl && (
          <Image
            alt={coinDenom ?? "coin image"}
            src={coinImageUrl}
            height={40}
            width={40}
          />
        )}
      </div>
      <div className="subtitle1 flex max-w-[200px] flex-col place-content-center">
        {coinName && (
          <div className="flex">
            <span className="text-white-high">{coinName}</span>
          </div>
        )}
        {coinDenom && (
          <span className="md:caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-400 md:w-28">
            {coinDenom}
          </span>
        )}
      </div>
    </div>
  </div>
);
