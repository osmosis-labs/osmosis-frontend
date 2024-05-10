import classNames from "classnames";
import { FunctionComponent } from "react";

import { PoolAssetInfo } from "~/components/assets/types";

interface Props {
  assets: PoolAssetInfo[] | undefined;
  size?: "sm" | "md";
  className?: string;
}

export const PoolAssetsIcon: FunctionComponent<Props> = ({
  assets,
  size = "md",
  className,
}) => {
  if (!assets) return null;
  return (
    <div
      style={{ width: `${assets.slice(undefined, 4).length * 30}px` }}
      className={classNames(
        "relative flex h-fit items-center",
        size === "md" ? "h-[50px]" : "h-[40px]",
        className
      )}
    >
      {assets.map(({ coinDenom, coinImageUrl }, index) =>
        index > 3 ? null : (
          <div
            key={coinDenom}
            style={{
              marginLeft: size === "md" ? `${index * 28}px` : `${index * 24}px`,
              zIndex: 30 - index,
            }}
            className={classNames(
              {
                [`h-[3.125rem] w-[3.125rem]`]: size === "md",
                [`h-[2.5rem] w-[2.5rem]`]: size === "sm",
                "shrink-0": index > 0,
              },
              "absolute flex items-center justify-center "
            )}
          >
            {index > 2 ? (
              <div className="body1 pl-4 text-white-mid">{`+${
                assets.length - 3
              }`}</div>
            ) : coinImageUrl ? (
              <img
                src={coinImageUrl}
                alt={coinDenom}
                width={size === "md" ? 50 : 40}
                height={size === "md" ? 50 : 40}
              />
            ) : (
              <img
                src="/icons/question-mark.svg"
                alt="no token icon"
                width={size === "md" ? 50 : 40}
                height={size === "md" ? 50 : 40}
              />
            )}
            <span className="absolute h-full w-full" title={coinDenom} />
          </div>
        )
      )}
    </div>
  );
};
