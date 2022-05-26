import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { PoolAssetInfo } from "./types";

interface Props {
  assets: PoolAssetInfo[] | undefined;
  size?: "sm" | "md";
}

// TODO: handle one asset

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
            "w-[3.8rem] h-[3.8rem]": size === "md",
            "w-[2.125rem] h-[2.125rem]": size === "sm",
          },
          "absolute z-10 rounded-full border bg-card border-enabledGold flex items-center justify-center overflow-hidden"
        )}
      >
        {assets[0].coinImageUrl ? (
          <Image
            src={assets[0].coinImageUrl}
            alt={assets[0].coinDenom}
            width={size === "md" ? 54 : 28}
            height={size === "md" ? 54 : 28}
          />
        ) : (
          <Image
            src="/icons/question-mark.svg"
            alt="no token icon"
            width={size === "md" ? 54 : 28}
            height={size === "md" ? 54 : 28}
          />
        )}
      </div>
      <div
        className={classNames(
          {
            "w-[3.8rem] h-[3.8rem] ml-10": size === "md",
            "w-[2.125rem] h-[2.125rem] ml-5": size === "sm",
          },
          "rounded-full border border-enabledGold shrink-0 flex items-center justify-center overflow-hidden"
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
            width={size === "md" ? 54 : 28}
            height={size === "md" ? 54 : 28}
          />
        ) : (
          <Image
            src="/icons/question-mark.svg"
            alt="no token icon"
            width={size === "md" ? 54 : 28}
            height={size === "md" ? 54 : 28}
          />
        )}
      </div>
    </div>
  );
};
