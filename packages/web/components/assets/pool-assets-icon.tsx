import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { PoolAssetInfo } from "./types";

interface Props {
  assets: PoolAssetInfo[] | undefined;
  size?: "sm" | "md";
}

export const PoolAssetsIcon: FunctionComponent<Props> = ({
  assets,
  size = "md",
}) => {
  if (!assets) return null;
  return (
    <div className="relative flex items-center">
      <div
        className={classNames(
          {
            "w-[3.125rem] h-[3.125rem]": size === "md",
            "w-[2.5rem] h-[2.5rem]": size === "sm",
          },
          "absolute z-10 flex items-center justify-center overflow-hidden"
        )}
      >
        {assets[0].coinImageUrl ? (
          <Image
            src={assets[0].coinImageUrl}
            alt={assets[0].coinDenom}
            width={size === "md" ? 50 : 40}
            height={size === "md" ? 50 : 40}
          />
        ) : (
          <Image
            src="/icons/question-mark.svg"
            alt="no token icon"
            width={size === "md" ? 50 : 40}
            height={size === "md" ? 50 : 40}
          />
        )}
      </div>
      <div
        className={classNames(
          {
            "w-[3.125rem] h-[3.125rem] ml-10": size === "md",
            "w-[2.5rem] h-[2.5rem] ml-5": size === "sm",
          },
          "shrink-0 flex items-center justify-center overflow-hidden"
        )}
      >
        {assets.length >= 3 ? (
          <div className="body1 text-white-mid ml-2.5">{`+${
            assets.length - 1
          }`}</div>
        ) : assets[1].coinImageUrl ? (
          <Image
            src={assets[1].coinImageUrl}
            alt={assets[1].coinDenom}
            width={size === "md" ? 50 : 40}
            height={size === "md" ? 50 : 40}
          />
        ) : (
          <Image
            src="/icons/question-mark.svg"
            alt="no token icon"
            width={size === "md" ? 50 : 40}
            height={size === "md" ? 50 : 40}
          />
        )}
      </div>
    </div>
  );
};
